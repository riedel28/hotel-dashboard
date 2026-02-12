import { Router } from 'express';

import {
  createReservationSchema,
  fetchReservationByIdSchema,
  fetchReservationsParamsSchema,
  reservationIdParamsSchema,
  searchGuestsParamsSchema,
  updateReservationSchema
} from '../../../shared/types/reservations';
import {
  createReservation,
  deleteReservation,
  getReservationById,
  getReservations,
  searchGuests,
  updateReservation
} from '../controllers/reservation-controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorization';
import {
  validateBody,
  validateParams,
  validateQuery
} from '../middleware/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Create reservation
router.post('/', validateBody(createReservationSchema), createReservation);

// Get reservations
router.get('/', validateQuery(fetchReservationsParamsSchema), getReservations);

// Search guests across reservations
router.get(
  '/guests/search',
  validateQuery(searchGuestsParamsSchema),
  searchGuests
);

// Get reservation by id
router.get(
  '/:id',
  validateParams(fetchReservationByIdSchema),
  getReservationById
);

// Update reservation
router.patch(
  '/:id',
  validateParams(reservationIdParamsSchema),
  validateBody(updateReservationSchema),
  updateReservation
);

// Delete reservation (admin only)
router.delete(
  '/:id',
  requireAdmin,
  validateParams(reservationIdParamsSchema),
  deleteReservation
);

export default router;
