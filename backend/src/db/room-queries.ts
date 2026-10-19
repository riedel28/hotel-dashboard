import { asc, eq, sql } from 'drizzle-orm';

import { db, type Transaction } from './pool';
import { reservations, rooms } from './schema';

// Query fragments about rooms that more than one controller needs.

// A reservation names its room (reservations.room_name) instead of holding
// it. It is active until the guest has checked out: not yet over, or the
// guest is still in the house past its end.
// ponytail: reservations carry no property, so a room of another property
// with the same name matches too; a reservations.room_id would end that.
export const hasActiveReservation = sql<boolean>`exists (
  select 1 from ${reservations}
  where ${reservations.room_name} = ${rooms.name}
    and ${reservations.state} <> 'checked_out'
    and (${reservations.booking_to} >= now()
      or ${reservations.state} in ('checked_in', 'ready_out'))
)`;

// Room numbers in the order a person reads them: 2 < 10 < 10A
export const naturalRoomNumber = sql`${rooms.room_number} collate numeric_sort`;

/** Every room of a property with what an import compares, in natural order. */
export const loadPropertyRooms = (
  executor: typeof db | Transaction,
  propertyId: string
) =>
  executor
    .select({
      id: rooms.id,
      room_number: rooms.room_number,
      name: rooms.name,
      room_type: rooms.room_type,
      floor: rooms.floor,
      has_active_reservation: hasActiveReservation
    })
    .from(rooms)
    .where(eq(rooms.property_id, propertyId))
    .orderBy(asc(naturalRoomNumber));
