// event.service.ts

import { Event, EventStatus, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../error/appError";
import { prisma } from "../../../shared/prisma";
import { IJwtPayload } from "../../commonType/userType";
import { IEventQuery } from "./event.interface";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";

// ============================================
// Get All Events (with filters & pagination)
// ============================================

const getAllEvents = async (options: IOptions, filters: any) => {
  const { search, type, location, date, minFee, maxFee, status } = filters;

  // pagination helper will now work properly
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  // Build filters
  const whereClause: Prisma.EventWhereInput = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},

      type ? { type: { equals: type, mode: "insensitive" } } : {},

      location ? { location: { contains: location, mode: "insensitive" } } : {},

      date
        ? {
            date: {
              gte: new Date(date),
              lt: new Date(
                new Date(date).setDate(new Date(date).getDate() + 1)
              ),
            },
          }
        : {},

      minFee !== undefined ? { joiningFee: { gte: minFee } } : {},
      maxFee !== undefined ? { joiningFee: { lte: maxFee } } : {},

      status ? { status } : {},
    ],
  };

  // Fetch events + count
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: whereClause,
      skip,
      take: limit, // fixed: now a number
      orderBy: { [options.sortBy || "createdAt"]: options.sortOrder || "desc" },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            averageRating: true,
            totalRatings: true,
          },
        },
        _count: {
          select: {
            participants: true,
            reviews: true,
          },
        },
      },
    }),

    prisma.event.count({ where: whereClause }),
  ]);

  return {
    data: events,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
// ============================================
// Get Single Event by ID
// ============================================
const getEventById = async (eventId: string): Promise<Event> => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          bio: true,
          location: true,
          averageRating: true,
          totalRatings: true,
        },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          participants: true,
          reviews: true,
        },
      },
    },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  return event;
};
// ============================================
// Get Events by Host
// ============================================
const getEventsByHostId = async (hostId: string) => {
  const events = await prisma.event.findMany({
    where: { hostId },
    include: {
      _count: {
        select: {
          participants: true,
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return events;
};

// ============================================
// Create Event
// ============================================
const createEvent = async (hostData: any, payload: any): Promise<Event> => {
  const hostEmail = hostData.email;
  // Check if host exists and has HOST or ADMIN role
  const host = await prisma.host.findUnique({
    where: { email: hostEmail },
  });
  const hostId = host?.id;
  console.log(hostId);

  if (!host) {
    throw new AppError(httpStatus.NOT_FOUND, "Host not found");
  }

  if (host.role !== "HOST" && host.role !== "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only hosts can create events. Please upgrade to host."
    );
  }

  // Validate date is in future
  const eventDate = new Date(payload.date);
  if (eventDate < new Date()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Event date must be in the future"
    );
  }

  // Create event
  const event = await prisma.event.create({
    data: {
      ...payload,
      date: eventDate,
      hostId: hostId,
    },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          averageRating: true,
        },
      },
    },
  });

  // Update host profile statistics
  await prisma.host.update({
    where: { id: hostId },
    data: {
      totalEventsHosted: { increment: 1 },
    },
  });

  return event;
};

const getEventsByHost = async (hostInfo: IJwtPayload) => {
  const host = await prisma.host.findUniqueOrThrow({
    where: {
      email: hostInfo.email,
    },
  });
  const hostId = host?.id;
  const events = await prisma.event.findMany({
    where: { hostId },
    include: {
      _count: {
        select: {
          participants: true,
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return events;
};

// ============================================
// Update Event
// ============================================
const updateEvent = async (
  eventId: string,
  userInfo: IJwtPayload,
  payload: Event
): Promise<Event> => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  // Check if user is the host or admin
  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });
  const userId = user?.id;

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (event.hostId !== userId && user.role !== "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this event"
    );
  }

  // Validate date if updating
  if (payload.date) {
    const eventDate = new Date(payload.date);
    if (eventDate < new Date()) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Event date must be in the future"
      );
    }
  }

  // Update event
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: payload,
    include: {
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          averageRating: true,
        },
      },
    },
  });

  return updatedEvent;
};

// ============================================
// Update Event Status
// ============================================
const updateEventStatus = async (
  eventId: string,
  userInfo: IJwtPayload,
  status: EventStatus
): Promise<Event> => {
  // Check event and authorization
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });
  const userId = user?.id;

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (event.hostId !== userId && user.role !== "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this event status"
    );
  }

  // Update status
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: { status },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
    },
  });

  return updatedEvent;
};

// ============================================
// Delete Event
// ============================================
const deleteEvent = async (
  eventId: string,
  userInfo: IJwtPayload
): Promise<void> => {
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  // Check authorization
  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });
  const userId = user?.id;

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (event.hostId !== userId && user.role !== "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this event"
    );
  }

  // Check if event has participants
  const participantsCount = await prisma.participant.count({
    where: { eventId, status: "JOINED" },
  });

  if (participantsCount > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete event with active participants. Please cancel the event first."
    );
  }

  // Delete event
  await prisma.event.delete({
    where: { id: eventId },
  });
};

export const EventService = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getEventsByHostId,
  getEventsByHost,
};
