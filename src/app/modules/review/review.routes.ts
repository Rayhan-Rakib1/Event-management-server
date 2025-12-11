// review.routes.ts

import express from 'express';
import { ReviewController } from './review.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// ============================================
// Public Routes
// ============================================

/**
 * GET /api/reviews/host/:hostId
 * Get all reviews for a specific host
 */
router.get('/host/:hostId', ReviewController.getHostReviews);

/**
 * GET /api/reviews/event/:eventId
 * Get all reviews for a specific event
 */
router.get('/event/:eventId', ReviewController.getEventReviews);

/**
 * GET /api/reviews/:id
 * Get single review by ID
 */
router.get('/:id', ReviewController.getReviewById);

// ============================================
// Protected Routes (Requires Authentication)
// ============================================

/**
 * POST /api/reviews
 * Create a new review (after participating in event)
 * Body: { rating: 5, comment: "Great event!", eventId: "event_id" }
 */
router.post(
  '/',
  auth('USER', 'HOST', 'ADMIN'),
  ReviewController.createReview
);

/**
 * GET /api/reviews/my-reviews
 * Get all reviews I have written
 */
router.get(
  '/my-reviews',
  auth('USER', 'HOST', 'ADMIN'),
  ReviewController.getMyReviews
);

/**
 * PUT /api/reviews/:id
 * Update my review
 * Body: { rating?: 4, comment?: "Updated comment" }
 */
router.put(
  '/:id',
  auth('USER', 'HOST', 'ADMIN'),
  ReviewController.updateReview
);

/**
 * DELETE /api/reviews/:id
 * Delete my review (or admin can delete any)
 */
router.delete(
  '/:id',
  auth('USER', 'HOST', 'ADMIN'),
  ReviewController.deleteReview
);

export const reviewRoutes = router;