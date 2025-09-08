import { Router } from 'express';

import {
  createReservationSchema,
  fetchReservationByIdSchema,
  fetchReservationsParamsSchema,
  updateReservationSchema
} from '../../../shared/types/reservations';
import {
  createReservation,
  deleteReservation,
  getReservationById,
  getReservations,
  updateReservation
} from '../controllers/reservation-controller';
import { authenticateToken } from '../middleware/auth';
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

// Get reservation by id
router.get(
  '/:id',
  validateParams(fetchReservationByIdSchema),
  getReservationById
);

// Update reservation
router.patch('/:id', validateBody(updateReservationSchema), updateReservation);

// Delete reservation
router.delete('/:id', deleteReservation);

export default router;
