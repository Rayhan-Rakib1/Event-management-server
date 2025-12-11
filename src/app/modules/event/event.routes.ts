// event.routes.ts

import express from 'express';
import { EventController } from './event.controller';
import auth from '../../middlewares/auth';
import { EventValidation } from './event.validation';
import { Role } from '@prisma/client';
import validateRequest from '../../middlewares/validationRequest';

const router = express.Router();

// ============================================
// Public Routes
// ============================================

/**
 * GET /api/events
 * Get all events (with filters & pagination)
 * Query: ?search=concert&type=Music&location=Dhaka&date=2024-12-10&page=1&limit=10
 */
router.get(
  '/all-events',
  validateRequest(EventValidation.getEventsQuerySchema),
  EventController.getAllEvents
);

/**
 * GET /api/events/:id
 * Get single event details
 */
router.get('/:id', EventController.getEventById);

/**
 * GET /api/events/host/:hostId
 * Get all events by a specific host
 */
router.get('/host/:hostId', EventController.getEventsByHostId);

// ============================================
// Protected Routes (Requires Authentication)
// ============================================

/**
 * POST /api/events
 * Create new event (HOST or ADMIN only)
 */
router.post(
  '/create-event',
  auth(Role.ADMIN, Role.HOST),
  validateRequest(EventValidation.createEventSchema),
  EventController.createEvent
);

/**
 * GET /api/events/my-events/hosted
 * Get my hosted events
 */
router.get(
  '/my-events/hosted',
  auth(Role.ADMIN, Role.HOST),
  EventController.getMyEventsByHost
);

/**
 * PUT /api/events/:id
 * Update event (Only host or admin)
 */
router.put(
  '/:id',
  auth(Role.ADMIN, Role.HOST),
  validateRequest(EventValidation.updateEventSchema),
  EventController.updateEvent
);

/**
 * PATCH /api/events/:id/status
 * Update event status (Only host or admin)
 * Body: { status: "CANCELLED" | "COMPLETED" | "OPEN" | "FULL" }
 */
router.patch(
  '/:id/status',
  auth(Role.ADMIN, Role.HOST),
  EventController.updateEventStatus
);

/**
 * DELETE /api/events/:id
 * Delete event (Only host or admin)
 */
router.delete(
  '/:id',
  auth(Role.ADMIN, Role.HOST),
  EventController.deleteEvent
);

export const eventRoutes = router;