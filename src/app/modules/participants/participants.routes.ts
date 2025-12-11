// participant.routes.ts

import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validationRequest';
import { ParticipantValidation } from './participants.validation';
import { ParticipantController } from './participants.controller';

const router = express.Router();


// ============================================
// Protected Routes (Requires Authentication)
// ============================================

/**
 * POST /api/participants/join
 * Join an event (Free or Paid)
 * Body: { eventId: "event_id_here" }
 * 
 * Response (Free Event):
 * {
 *   message: "Successfully joined the event",
 *   requiresPayment: false,
 *   participant: { ... }
 * }
 * 
 * Response (Paid Event):
 * {
 *   message: "Payment required to join this event",
 *   requiresPayment: true,
 *   clientSecret: "pi_xxx_secret_xxx",
 *   transactionId: "TXN-xxx",
 *   amount: 500
 * }
 */
router.post(
  '/join',
  auth('USER', 'HOST', 'ADMIN'),
  validateRequest(ParticipantValidation.joinEventSchema),
  ParticipantController.joinEvent
);

/**
 * POST /api/participants/confirm-payment
 * Confirm payment and join event
 * Body: { paymentIntentId: "pi_xxx", transactionId: "TXN-xxx" }
 */
router.post(
  '/confirm-payment',
  auth('USER', 'HOST', 'ADMIN'),
  validateRequest(ParticipantValidation.confirmPaymentSchema),
  ParticipantController.confirmPayment
);

/**
 * DELETE /api/participants/leave/:eventId
 * Leave an event (with refund if paid)
 */
router.delete(
  '/leave/:eventId',
  auth('USER', 'HOST', 'ADMIN'),
  ParticipantController.leaveEvent
);

/**
 * GET /api/participants/my-events
 * Get all events I have joined
 */
router.get(
  '/my-events',
  auth('USER', 'HOST', 'ADMIN'),
  ParticipantController.getMyJoinedEvents
);

/**
 * GET /api/participants/event/:eventId
 * Get all participants of an event (Host/Admin only)
 */
router.get(
  '/event/:eventId',
  auth('HOST', 'ADMIN'),
  ParticipantController.getEventParticipants
);

export const participantRoutes = router;