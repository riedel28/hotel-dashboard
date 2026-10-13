import type { Room } from 'shared/types/rooms';

/** A room for component tests. */
export const testRoom: Room = {
  id: 7,
  name: 'Garden',
  property_id: '00000000-0000-4000-8000-000000000000',
  room_number: '12A',
  room_type: 'Suite',
  floor: 1,
  status: 'available',
  has_active_reservation: false,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z'
};
