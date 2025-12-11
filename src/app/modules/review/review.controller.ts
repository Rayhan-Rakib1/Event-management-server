// review.controller.ts

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../shared/sendResponse';
import catchAsync from '../../shared/catchAsync';
import { IJwtPayload } from '../../commonType/userType';
import { ReviewService } from './review.services';

// ============================================
// 1. Create Review
// ============================================
const createReview = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await ReviewService.createReview(
      user as IJwtPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Review created successfully',
      data: result,
    });
  }
);

// ============================================
// 2. Get Host Reviews
// ============================================
const getHostReviews = catchAsync(async (req: Request, res: Response) => {
  const { hostId } = req.params;
  const result = await ReviewService.getHostReviews(hostId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Host reviews retrieved successfully',
    data: result,
  });
});

// ============================================
// 3. Get Event Reviews
// ============================================
const getEventReviews = catchAsync(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const result = await ReviewService.getEventReviews(eventId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event reviews retrieved successfully',
    data: result,
  });
});

// ============================================
// 4. Get My Reviews
// ============================================
const getMyReviews = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await ReviewService.getMyReviews(user as IJwtPayload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Your reviews retrieved successfully',
      data: result,
    });
  }
);

// ============================================
// 5. Get Single Review by ID
// ============================================
const getReviewById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.getReviewById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review retrieved successfully',
    data: result,
  });
});

// ============================================
// 6. Update Review
// ============================================
const updateReview = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const result = await ReviewService.updateReview(
      id,
      user as IJwtPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Review updated successfully',
      data: result,
    });
  }
);

// ============================================
// 7. Delete Review
// ============================================
const deleteReview = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    await ReviewService.deleteReview(id, user as IJwtPayload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Review deleted successfully',
      data: null,
    });
  }
);

export const ReviewController = {
  createReview,
  getHostReviews,
  getEventReviews,
  getMyReviews,
  getReviewById,
  updateReview,
  deleteReview,
};