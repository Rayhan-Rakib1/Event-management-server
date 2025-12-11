// review.service.ts

import { Review } from '@prisma/client';
import { prisma } from '../../../shared/prisma';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { IJwtPayload } from '../../commonType/userType';

interface IReviewCreate {
  rating: number;
  comment?: string;
  eventId: string;
}

interface IReviewUpdate {
  rating?: number;
  comment?: string;
}

// ============================================
// 1. Create Review (Rate Host after Event)
// ============================================
const createReview = async (
  userInfo: IJwtPayload,
  payload: IReviewCreate
): Promise<Review> => {
  const { rating, comment, eventId } = payload;

  // 1. Get user
  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const userId = user.id;

  // 2. Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      host: true,
    },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  // 3. Check if user participated in this event
  const participant = await prisma.participant.findUnique({
    where: {
      userId_eventId: { userId, eventId },
    },
  });

  if (!participant) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You must participate in the event to leave a review'
    );
  }

  if (participant.status !== 'JOINED') {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Only active participants can leave reviews'
    );
  }

  // 4. Check if event is completed
  const eventDate = new Date(event.date);
  if (eventDate > new Date()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can only review after the event is completed'
    );
  }

  // 5. Check if user already reviewed this event
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_eventId: { userId, eventId },
    },
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already reviewed this event'
    );
  }

  // 6. Validate rating (1-5)
  if (rating < 1 || rating > 5) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Rating must be between 1 and 5'
    );
  }

  // 7. Create review
  const review = await prisma.review.create({
    data: {
      userId,
      hostId: event.hostId,
      eventId,
      rating,
      comment,
    },
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
  });

  // 8. Update host's average rating
  await updateHostRating(event.hostId);

  return review;
};

// ============================================
// 2. Get All Reviews for a Host
// ============================================
const getHostReviews = async (hostId: string) => {
  const host = await prisma.host.findUnique({
    where: { id: hostId },
  });

  if (!host) {
    throw new AppError(httpStatus.NOT_FOUND, 'Host not found');
  }

  const reviews = await prisma.review.findMany({
    where: { hostId },
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
          date: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return reviews;
};

// ============================================
// 3. Get All Reviews for an Event
// ============================================
const getEventReviews = async (eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  const reviews = await prisma.review.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return reviews;
};

// ============================================
// 4. Get My Reviews (Reviews I gave)
// ============================================
const getMyReviews = async (userInfo: IJwtPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          date: true,
        },
      },
      host: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return reviews;
};

// ============================================
// 5. Update Review
// ============================================
const updateReview = async (
  reviewId: string,
  userInfo: IJwtPayload,
  payload: IReviewUpdate
): Promise<Review> => {
  // 1. Get user
  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const userId = user.id;

  // 2. Check if review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  // 3. Check authorization
  if (review.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only update your own reviews'
    );
  }

  // 4. Validate rating if provided
  if (payload.rating && (payload.rating < 1 || payload.rating > 5)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Rating must be between 1 and 5'
    );
  }

  // 5. Update review
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: payload,
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
  });

  // 6. Update host rating if rating changed
  if (payload.rating) {
    await updateHostRating(review.hostId);
  }

  return updatedReview;
};

// ============================================
// 6. Delete Review
// ============================================
const deleteReview = async (
  reviewId: string,
  userInfo: IJwtPayload
): Promise<void> => {
  // 1. Get user
  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const userId = user.id;

  // 2. Check if review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  // 3. Check authorization (user or admin)
  if (review.userId !== userId && userInfo.role !== 'ADMIN') {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only delete your own reviews'
    );
  }

  // 4. Delete review
  await prisma.review.delete({
    where: { id: reviewId },
  });

  // 5. Update host rating
  await updateHostRating(review.hostId);
};

// ============================================
// 7. Get Single Review by ID
// ============================================
const getReviewById = async (reviewId: string): Promise<Review> => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
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
          date: true,
        },
      },
      host: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
    },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  return review;
};

// ============================================
// Helper: Update Host Average Rating
// ============================================
const updateHostRating = async (hostId: string): Promise<void> => {
  // Calculate average rating
  const reviews = await prisma.review.findMany({
    where: { hostId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    await prisma.host.update({
      where: { id: hostId },
      data: {
        averageRating: 0,
        totalRatings: 0,
      },
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  // Update host
  await prisma.host.update({
    where: { id: hostId },
    data: {
      averageRating: Number(averageRating.toFixed(2)),
      totalRatings: reviews.length,
    },
  });
};

export const ReviewService = {
  createReview,
  getHostReviews,
  getEventReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getReviewById,
};