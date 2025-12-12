// host.service.ts

import { Host, PaymentStatus, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { prisma } from "../../../shared/prisma";
import { IHostStats, IHostUpdate } from "./host.interface";
import AppError from "../../error/appError";
import { IJwtPayload } from "../../commonType/userType";

// ============================================
// 1. Get Single Host by ID
// ============================================
const getHostById = async (hostId: string): Promise<Host> => {
  const host = await prisma.host.findUnique({
    where: { id: hostId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
        },
      },
      hostedEvents: {
        take: 10,
        orderBy: { date: "desc" },
        include: {
          _count: {
            select: { participants: true },
          },
        },
      },
      receivedReviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          event: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          hostedEvents: true,
          receivedReviews: true,
        },
      },
    },
  });

  if (!host) {
    throw new AppError(httpStatus.NOT_FOUND, "Host not found");
  }

  return host;
};

// ============================================
// 2. Get My Host Profile
// ============================================
const getMyHostProfile = async (hostInfo: IJwtPayload) => {
  const host = await prisma.host.findUnique({
    where: { email: hostInfo.email },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
        },
      },
      hostedEvents: {
        take: 10,
        orderBy: { date: "desc" },
        include: {
          _count: {
            select: { participants: true },
          },
        },
      },
      receivedReviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          event: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          hostedEvents: true,
          receivedReviews: true,
        },
      },
    },
  });

  if (!host) {
    throw new AppError(httpStatus.NOT_FOUND, "Host profile not found");
  }

  return host;
};

// ============================================
// 3. Update Host Profile
// ============================================
const updateHost = async (
  hostId: string,
  hostInfo: IJwtPayload,
  payload: IHostUpdate
): Promise<Host> => {
  // Find host by email from JWT
  const host = await prisma.host.findUnique({
    where: { email: hostInfo.email },
    include: {
      user: true,
    },
  });

  if (!host) {
    throw new AppError(httpStatus.NOT_FOUND, "Host not found");
  }

  // Check if the hostId matches
  if (host.id !== hostId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this host profile"
    );
  }

  // Check if user is admin (can update any host)
  if (hostInfo.role !== "ADMIN" && host.email !== hostInfo.email) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this host profile"
    );
  }

  // Update host
  const updatedHost = await prisma.host.update({
    where: { id: hostId },
    data: payload,
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      _count: {
        select: {
          hostedEvents: true,
          receivedReviews: true,
        },
      },
    },
  });

  return updatedHost;
};

// ============================================
// 4. Delete Host Profile
// ============================================
const deleteHost = async (
  hostId: string,
  hostInfo: IJwtPayload
): Promise<void> => {
  // Find host by email
  const host = await prisma.host.findUnique({
    where: { email: hostInfo.email },
    include: {
      user: true,
    },
  });

  if (!host) {
    throw new AppError(httpStatus.NOT_FOUND, "Host not found");
  }

  // Check authorization
  if (hostInfo.role !== "ADMIN" && host.email !== hostInfo.email) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this host profile"
    );
  }

  // Check if hostId matches
  if (host.id !== hostId) {
    throw new AppError(httpStatus.FORBIDDEN, "Host ID mismatch");
  }

  // Check if host has upcoming events
  const upcomingEvents = await prisma.event.count({
    where: {
      hostId,
      date: { gte: new Date() },
      status: { in: ["OPEN", "FULL"] },
    },
  });

  if (upcomingEvents > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete host profile with upcoming events. Please cancel or complete them first."
    );
  }

  // Update user role back to USER
  await prisma.user.update({
    where: { id: host.user.id },
    data: { role: "USER" },
  });

  // Delete host profile
  await prisma.host.delete({
    where: { id: hostId },
  });
};

// ============================================
// 5. Get Host Statistics
// ============================================
const getHostStats = async (hostId: string): Promise<IHostStats> => {
  const host = await prisma.host.findUnique({
    where: { id: hostId },
  });

  if (!host) {
    throw new AppError(httpStatus.NOT_FOUND, "Host not found");
  }

  const [upcomingEvents, completedEvents] = await Promise.all([
    prisma.event.count({
      where: {
        hostId,
        date: { gte: new Date() },
        status: { in: ["OPEN", "FULL"] },
      },
    }),
    prisma.event.count({
      where: {
        hostId,
        status: "COMPLETED",
      },
    }),
  ]);

  return {
    totalEventsHosted: host.totalEventsHosted,
    totalRevenue: host.totalRevenue,
    averageRating: host.averageRating || 0,
    totalRatings: host.totalRatings,
    upcomingEvents,
    completedEvents,
  };
};

// ============================================
// 6. Get Top Rated Hosts
// ============================================
const getTopRatedHosts = async (limit: number = 10) => {
  const hosts = await prisma.host.findMany({
    where: {
      totalRatings: { gt: 0 },
    },
    orderBy: {
      averageRating: "desc",
    },
    take: limit,
    include: {
      _count: {
        select: {
          hostedEvents: true,
          receivedReviews: true,
        },
      },
    },
  });

  return hosts;
};

// ============================================
// 7. Get Host Average Rating
// ============================================
const getHostAvgRating = async (
  hostInfo: IJwtPayload
): Promise<{ totalRating: number; averageRating: number } | null> => {
  const host = await prisma.host.findUnique({
    where: { email: hostInfo.email },
  });

  if (!host) {
    throw new AppError(httpStatus.NOT_FOUND, "Host not found");
  }

  // Fetch all reviews for this host
  const reviews = await prisma.review.findMany({
    where: { hostId: host.id },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    return {
      totalRating: 0,
      averageRating: 0,
    };
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / reviews.length;

  return {
    totalRating,
    averageRating: Number(averageRating.toFixed(2)),
  };
};

// ============================================
// 8. Get Host Dashboard Data
// ============================================
const getHostDashboard = async (hostId: string) => {
  const host = await prisma.host.findUnique({
    where: { id: hostId },
  });

  if (!host) {
    throw new AppError(httpStatus.NOT_FOUND, "Host not found");
  }

  const [
    upcomingEvents,
    pastEvents,
    totalParticipants,
    recentReviews,
    monthlyRevenue,
  ] = await Promise.all([
    // Upcoming events
    prisma.event.findMany({
      where: {
        hostId,
        date: { gte: new Date() },
        status: { in: ["OPEN", "FULL"] },
      },
      orderBy: { date: "asc" },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    }),

    // Past events
    prisma.event.findMany({
      where: {
        hostId,
        status: "COMPLETED",
      },
      orderBy: { date: "desc" },
      take: 5,
      include: {
        _count: {
          select: { participants: true },
        },
      },
    }),

    // Total participants across all events
    prisma.participant.count({
      where: {
        event: { hostId },
        status: "JOINED",
      },
    }),

    // Recent reviews
    prisma.review.findMany({
      where: { hostId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    // Monthly revenue (last 30 days)
    prisma.payment.aggregate({
      where: {
        event: { hostId },
        status: PaymentStatus.PAID,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    stats: {
      totalEventsHosted: host.totalEventsHosted,
      totalRevenue: host.totalRevenue,
      averageRating: host.averageRating,
      totalRatings: host.totalRatings,
      totalParticipants,
      monthlyRevenue: monthlyRevenue?._sum.amount || 0,
    },
    upcomingEvents,
    pastEvents,
    recentReviews,
  };
};

export const HostService = {
  getHostById,
  getMyHostProfile,
  updateHost,
  deleteHost,
  getHostStats,
  getTopRatedHosts,
  getHostAvgRating,
  getHostDashboard,
};