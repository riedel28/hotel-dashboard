import { and, eq, inArray, not, sql } from 'drizzle-orm';

import type {
  RoomImportPreview,
  RoomImportResult
} from '../../../shared/types/room-imports';
import { type Transaction } from '../db/pool';
import { hasActiveReservation } from '../db/room-queries';
import { rooms } from '../db/schema';
import type { ExistingRoom } from './room-import-plan';

/** The rooms are not what the plan was made from; nothing may be applied. */
export class StalePreview extends Error {}

const BATCH = 500;
const batches = <T>(items: T[]) =>
  Array.from({ length: Math.ceil(items.length / BATCH) }, (_, index) =>
    items.slice(index * BATCH, (index + 1) * BATCH)
  );

/** Runs a plan inside the caller's transaction: all of it or, by throwing, none. */
export async function applyRoomImportPlan(
  tx: Transaction,
  propertyId: string,
  plan: RoomImportPreview,
  existing: ExistingRoom[]
): Promise<RoomImportResult> {
  const created = plan.rows.filter((row) => row.status === 'new');
  for (const batch of batches(created)) {
    await tx.insert(rooms).values(
      batch.map((row) => ({
        property_id: propertyId,
        room_number: row.room_number,
        name: row.name ?? row.room_number,
        room_type: row.room_type,
        floor: row.floor
      }))
    );
  }

  // One statement per batch instead of one per room
  const idOf = new Map(existing.map((room) => [room.room_number, room.id]));
  const updated = plan.rows.filter((row) => row.status === 'changed');
  for (const batch of batches(updated)) {
    const values = sql.join(
      batch.map(
        (row) =>
          sql`(${idOf.get(row.room_number)}::bigint, ${row.name}::text, ${row.room_type}::text, ${row.floor}::integer)`
      ),
      sql`, `
    );
    await tx.execute(sql`
      update ${rooms}
      set name = v.name, room_type = v.room_type, floor = v.floor,
          updated_at = now()
      from (values ${values}) as v(id, name, room_type, floor)
      where ${rooms.id} = v.id and ${rooms.property_id} = ${propertyId}
    `);
  }

  const deletable = plan.deletions
    .filter((room) => !room.has_active_reservation)
    .map((room) => room.id);
  if (deletable.length) {
    const deleted = await tx
      .delete(rooms)
      .where(
        and(
          eq(rooms.property_id, propertyId),
          inArray(rooms.id, deletable),
          not(hasActiveReservation)
        )
      )
      .returning({ id: rooms.id });
    // A reservation arrived after the plan was read
    if (deleted.length !== deletable.length) {
      throw new StalePreview();
    }
  }

  return {
    created: created.length,
    updated: updated.length,
    deleted: deletable.length,
    skipped: plan.summary.errors + plan.deletions.length - deletable.length
  };
}
