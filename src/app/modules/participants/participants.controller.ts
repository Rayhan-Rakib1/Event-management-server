// participant.controller.ts

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../shared/sendResponse';
import catchAsync from '../../shared/catchAsync';
import { IJwtPayload } from '../../commonType/userType';
import { ParticipantService } from './participants.serveces';

// ============================================
// 1. Join Event
// ============================================
const joinEvent = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user; // ✅ Fixed: was userId, now user
    const result = await ParticipantService.joinEvent(
      user as IJwtPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result.message,
      data: result,
    });
  }
);

// ============================================
// 2. Confirm Payment
// ============================================
const confirmPayment = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user; // ✅ Fixed: was userId, now user
    const { paymentIntentId, transactionId } = req.body;

    const result = await ParticipantService.confirmPayment(
      user as IJwtPayload,
      paymentIntentId,
      transactionId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Payment confirmed and successfully joined the event',
      data: result,
    });
  }
);

// ============================================
// 3. Leave Event
// ============================================
const leaveEvent = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const { eventId } = req.params;

    await ParticipantService.leaveEvent(user as IJwtPayload, eventId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Successfully left the event',
      data: null,
    });
  }
);

// ============================================
// 4. Get My Joined Events
// ============================================
const getMyJoinedEvents = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await ParticipantService.getMyJoinedEvents(
      user as IJwtPayload
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Joined events retrieved successfully',
      data: result,
    });
  }
);

// ============================================
// 5. Get Event Participants (Host/Admin only)
// ============================================
const getEventParticipants = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const { eventId } = req.params;

    const result = await ParticipantService.getEventParticipants(
      eventId,
      user as IJwtPayload
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Event participants retrieved successfully',
      data: result,
    });
  }
);

// ============================================
// 6. Stripe Webhook
// ============================================
const handleStripeWebhook = catchAsync(
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = req.body; // Must be raw buffer

    await ParticipantService.handleStripeWebhook(signature, rawBody);

    res.status(200).json({ received: true });
  }
);

export const ParticipantController = {
  joinEvent,
  confirmPayment,
  leaveEvent,
  getMyJoinedEvents,
  getEventParticipants,
  handleStripeWebhook,
};