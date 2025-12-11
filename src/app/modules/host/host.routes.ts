// host.routes.ts

import express from 'express';
import { HostController } from './host.controller';
import auth from '../../middlewares/auth';
import { HostValidation } from './host.validation';
import validateRequest from '../../middlewares/validationRequest';

const router = express.Router();

// ============================================
// Public Routes
// ============================================



/**
 * GET /api/hosts/top-rated
 * Get top rated hosts
 * Query: ?limit=10
 */
router.get('/top-rated', HostController.getTopRatedHosts);

/**
 * GET /api/hosts/:id
 * Get single host by ID
 */
router.get('/:id', HostController.getHostById);


/**
 * GET /api/hosts/:id/stats
 * Get host statistics
 */
router.get('/:id/stats', HostController.getHostStats);

/**
 * GET /api/hosts/:id/dashboard
 * Get host dashboard data (protected)
 */
router.get(
  '/:id/dashboard',
  auth('HOST', 'ADMIN'),
  HostController.getHostDashboard
);

// ============================================
// Protected Routes (Requires Authentication)
// ============================================


/**
 * GET /api/hosts/me/profile
 * Get my host profile
 */
router.get(
  '/me/profile',
  auth('HOST', 'ADMIN'),
  HostController.getMyHostProfile
);

/**
 * PUT /api/hosts/:id
 * Update host profile (Only self or admin)
 * Body: { name?, profileImage?, bio?, location?, gender?, interests? }
 */
router.put(
  '/:id',
  auth('HOST', 'ADMIN'),
  validateRequest(HostValidation.updateHostSchema),
  HostController.updateHost
);

/**
 * DELETE /api/hosts/:id
 * Delete host profile (Only self or admin)
 */
router.delete(
  '/:id',
  auth('HOST', 'ADMIN'),
  HostController.deleteHost
);

export const hostRoutes = router;