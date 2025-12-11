import { Participant, ParticipantStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../../../shared/prisma";
import AppError from "../../error/appError";
import httpStatus from "http-status";
import Stripe from "stripe";
import { IJwtPayload } from "../../commonType/userType";
import { stripe } from "../../helper/stripe";

// ============================================
// 1. Join Event (with Payment if needed)
// ============================================
const joinEvent = async (
  userInfo: IJwtPayload,
  payload: { eventId: string }
) => {
  const { eventId } = payload;

  // 1. Get user from database
  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const userId = user.id;

  // 2. Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: { participants: true },
      },
    },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  // 3. Check if event is open
  if (event.status !== "OPEN") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Event is not open for registration"
    );
  }

  // 4. Check if event is full
  if (event._count.participants >= event.maxParticipants) {
    throw new AppError(httpStatus.BAD_REQUEST, "Event is already full");
  }

  // 5. Check if user already joined
  const existingParticipant = await prisma.participant.findUnique({
    where: {
      userId_eventId: { userId, eventId },
    },
  });

  if (existingParticipant) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already joined this event"
    );
  }

  // 6. Check if joining fee is required
  if (event.joiningFee > 0) {
    // PAID EVENT - Create Payment Intent
    const transactionId = `TXN-${Date.now()}-${userId.slice(0, 8)}`;

    // Create Payment Intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(event.joiningFee * 100), // Stripe expects amount in cents
      currency: "usd",
      metadata: {
        userId,
        eventId,
        transactionId,
        eventName: event.name,
        userName: user.name,
      },
      description: `Payment for ${event.name}`,
    });

    // Create Payment record in database
    await prisma.payment.create({
      data: {
        userId,
        eventId,
        amount: event.joiningFee,
        currency: "USD",
        status: PaymentStatus.UNPAID,
        transactionId: transactionId,
        paymentMethod: "Stripe",
        paymentGatewayData: paymentIntent.id, // Store Stripe Payment Intent ID
      },
    });

    // Create Participant with UNPAID status
    await prisma.participant.create({
      data: {
        userId,
        eventId,
        status: "JOINED",
        paymentStatus: "UNPAID",
        paidAmount: null,
        paymentDate: null,
      },
    });

    return {
      message: "Payment required to join this event",
      requiresPayment: true,
      clientSecret: paymentIntent.client_secret!,
      transactionId,
      amount: event.joiningFee,
    };
  } else {
    // FREE EVENT - Join directly
    const participant = await prisma.participant.create({
      data: {
        userId,
        eventId,
        status: "JOINED",
        paymentStatus: "PAID", // Free event = already paid
        paidAmount: 0,
        paymentDate: new Date(),
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            time: true,
            location: true,
          },
        },
      },
    });

    // Update event status if full
    const updatedCount = event._count.participants + 1;
    if (updatedCount >= event.maxParticipants) {
      await prisma.event.update({
        where: { id: eventId },
        data: { status: "FULL" },
      });
    }

    return {
      message: "Successfully joined the event",
      requiresPayment: false,
      participant,
    };
  }
};

// ============================================
// 2. Confirm Payment & Update Participant
// ============================================
const confirmPayment = async (
  userInfo: IJwtPayload,
  paymentIntentId: string,
  transactionId: string
): Promise<Participant> => {
  // 1. Get user
  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const userId = user.id;

  // 2. Verify Payment with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment has not been completed"
    );
  }

  // 3. Find payment record
  const payment = await prisma.payment.findUnique({
    where: { transactionId },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment record not found");
  }

  if (payment.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to confirm this payment"
    );
  }

  if (payment.status === PaymentStatus.PAID) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment already confirmed");
  }

  // 4. Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.PAID,
      updatedAt: new Date(),
    },
  });

  // 5. Update participant payment status
  const participant = await prisma.participant.update({
    where: {
      userId_eventId: {
        userId,
        eventId: payment.eventId,
      },
    },
    data: {
      paymentStatus: "PAID",
      paidAmount: payment.amount,
      paymentDate: new Date(),
    },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          date: true,
          time: true,
          location: true,
          maxParticipants: true,
          host: {
            select: {
              id: true,
              email: true,
            },
          },
          _count: {
            select: { participants: true },
          },
        },
      },
    },
  });

  // 6. Update event status if full
  const event = participant.event;
  if (event._count.participants >= event.maxParticipants) {
    await prisma.event.update({
      where: { id: payment.eventId },
      data: { status: "FULL" },
    });
  }

  // 7. Update host's total revenue
  await prisma.host.updateMany({
    where: { email: event.host.email },
    data: {
      totalRevenue: { increment: payment.amount },
    },
  });

  return participant;
};

// ============================================
// 3. Leave Event
// ============================================
const leaveEvent = async (
  userInfo: IJwtPayload,
  eventId: string
): Promise<void> => {
  // Get user
  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const userId = user.id;

  // Check if participant exists
  const participant = await prisma.participant.findUnique({
    where: {
      userId_eventId: { userId, eventId },
    },
    include: {
      event: true,
    },
  });

  if (!participant) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "You are not a participant of this event"
    );
  }

  // Check if event already started (can't leave)
  const eventDate = new Date(participant.event.date);
  if (eventDate < new Date()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot leave event that has already started"
    );
  }

  // Check if payment was made (need refund logic)
  if (
    participant.paymentStatus === PaymentStatus.PAID &&
    participant.paidAmount! > 0
  ) {
    const payment = await prisma.payment.findFirst({
      where: {
        userId,
        eventId,
        status: PaymentStatus.PAID,
      },
    });

    if (payment && payment.paymentGatewayData) {
      const pi = await stripe.paymentIntents.retrieve(
        String(payment.paymentGatewayData)
      );

      // Tell TS this is PaymentIntent
      const paymentIntent = (
        "data" in pi ? pi.data : pi
      ) as Stripe.PaymentIntent;
      console.log();

      const charge = paymentIntent
      // const charge = paymentIntent.charges?.data?.[0];

      if (charge) {
        await stripe.refunds.create({
          charge: charge.id,
          amount: Math.round(payment.amount * 100),
        });

        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "REFUNDED" },
        });
      }
    }
  }

  // Update participant status
  await prisma.participant.update({
    where: { id: participant.id },
    data: {
      status: "LEFT",
      paymentStatus: "REFUNDED",
    },
  });

  // Update event status if was full
  if (participant.event.status === "FULL") {
    await prisma.event.update({
      where: { id: eventId },
      data: { status: "OPEN" },
    });
  }
};

// ============================================
// 4. Get My Joined Events
// ============================================
const getMyJoinedEvents = async (userInfo: IJwtPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const participants = await prisma.participant.findMany({
    where: {
      userId: user.id,
      status: "JOINED",
    },
    include: {
      event: {
        include: {
          host: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              averageRating: true,
            },
          },
          _count: {
            select: { participants: true },
          },
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  return participants;
};

// ============================================
// 5. Get Event Participants (Host Only)
// ============================================
const getEventParticipants = async (eventId: string, userInfo: IJwtPayload) => {
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      host: true,
    },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  // Check if user is host or admin
  if (event.host.email !== userInfo.email && userInfo.role !== "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to view participants"
    );
  }

  const participants = await prisma.participant.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          location: true,
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  return participants;
};

// ============================================
// 6. Stripe Webhook Handler
// ============================================
const handleStripeWebhook = async (signature: string, rawBody: Buffer) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Webhook signature verification failed: ${err.message}`
    );
  }

  // Handle different event types
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const transactionId = paymentIntent.metadata.transactionId;

      // Auto-confirm payment
      const payment = await prisma.payment.findUnique({
        where: { transactionId },
      });

      if (payment && payment.status === PaymentStatus.UNPAID) {
        const user = await prisma.user.findUnique({
          where: { id: payment.userId },
        });

        if (user) {
          await confirmPayment(
            { email: user.email, role: user.role } as IJwtPayload,
            paymentIntent.id,
            transactionId
          );
        }
      }
      break;

    case "payment_intent.payment_failed":
      const failedIntent = event.data.object as Stripe.PaymentIntent;
      const failedTxnId = failedIntent.metadata.transactionId;

      await prisma.payment.updateMany({
        where: { transactionId: failedTxnId },
        data: { status: "FAILED" },
      });
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

export const ParticipantService = {
  joinEvent,
  confirmPayment,
  leaveEvent,
  getMyJoinedEvents,
  getEventParticipants,
  handleStripeWebhook,
};
