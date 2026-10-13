import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  not,
  or,
  type SQL,
  sql
} from 'drizzle-orm';

import type {
  CreateRoomData,
  FetchRoomsParams,
  RoomErrorCode,
  UpdateRoomData
} from '../../../shared/types/rooms';
import { db } from '../db/pool';
import { reservations, rooms } from '../db/schema';
import { withFailMessage } from '../middleware/error';
import {
  requireSelectedProperty,
  type SelectedPropertyRequest
} from '../middleware/selected-property';
import { escapeLikePattern, isUniqueViolation } from '../utils/sql';

// Property scope is resolved by attachSelectedProperty. Without a selected
// property, lists are empty and writes are 400. A room of another property
// is a 404.
const handle = withFailMessage<SelectedPropertyRequest>;

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

const errors: Record<RoomErrorCode, string> = {
  ROOM_NUMBER_TAKEN: 'A room with this number already exists',
  ROOM_HAS_ACTIVE_RESERVATION: 'The room has an active reservation'
};

const conflict = (code: RoomErrorCode) => ({ error: errors[code], code });

function selectRooms(where: SQL | undefined) {
  return db
    .select({
      id: rooms.id,
      name: rooms.name,
      property_id: rooms.property_id,
      room_number: rooms.room_number,
      room_type: rooms.room_type,
      floor: rooms.floor,
      status: rooms.status,
      has_active_reservation: hasActiveReservation,
      created_at: rooms.created_at,
      updated_at: rooms.updated_at
    })
    .from(rooms)
    .where(where);
}

type RoomRow = Awaited<ReturnType<typeof selectRooms>>[number];

const transformRoom = (room: RoomRow) => ({
  ...room,
  created_at: room.created_at.toISOString(),
  updated_at: room.updated_at.toISOString()
});

const inProperty = (propertyId: string, roomId: number) =>
  and(eq(rooms.property_id, propertyId), eq(rooms.id, roomId));

async function findRoom(propertyId: string, roomId: number) {
  const [room] = await selectRooms(inProperty(propertyId, roomId));
  return room;
}

const sortColumns = {
  room_number: naturalRoomNumber,
  name: rooms.name,
  room_type: rooms.room_type,
  floor: rooms.floor,
  status: rooms.status
};

const getRooms = handle('Failed to fetch rooms', async (req, res) => {
  const { q, status, room_type, floor, sort_by, sort_order } =
    req.query as FetchRoomsParams;
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.per_page) || 10;

  const propertyId = req.selectedPropertyId ?? null;
  if (!propertyId) {
    return res
      .status(200)
      .json({ index: [], page, per_page: perPage, total: 0, page_count: 0 });
  }

  const conditions: (SQL | undefined)[] = [eq(rooms.property_id, propertyId)];

  if (q) {
    const pattern = `%${escapeLikePattern(q)}%`;
    conditions.push(
      or(ilike(rooms.room_number, pattern), ilike(rooms.name, pattern))
    );
  }
  if (status) {
    conditions.push(eq(rooms.status, status));
  }
  if (room_type?.length) {
    const named = room_type.filter(Boolean);
    conditions.push(
      or(
        named.length ? inArray(rooms.room_type, named) : undefined,
        named.length < room_type.length
          ? or(isNull(rooms.room_type), eq(rooms.room_type, ''))
          : undefined
      )
    );
  }
  if (floor?.length) {
    conditions.push(inArray(rooms.floor, floor));
  }

  const where = and(...conditions);
  const direction = sort_order === 'desc' ? desc : asc;

  const [index, [{ total }]] = await Promise.all([
    selectRooms(where)
      .orderBy(
        direction(sortColumns[sort_by ?? 'room_number']),
        asc(naturalRoomNumber)
      )
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ total: count() }).from(rooms).where(where)
  ]);

  res.status(200).json({
    index: index.map(transformRoom),
    page,
    per_page: perPage,
    total,
    page_count: Math.ceil(total / perPage)
  });
});

const getRoomFilterOptions = handle(
  'Failed to fetch room filter options',
  async (req, res) => {
    const propertyId = req.selectedPropertyId ?? null;
    if (!propertyId) {
      return res.status(200).json({ room_types: [], floors: [] });
    }

    const ofProperty = eq(rooms.property_id, propertyId);
    const [types, floors] = await Promise.all([
      db
        .selectDistinct({ room_type: rooms.room_type })
        .from(rooms)
        .where(
          and(
            ofProperty,
            isNotNull(rooms.room_type),
            not(eq(rooms.room_type, ''))
          )
        )
        .orderBy(asc(rooms.room_type)),
      db
        .selectDistinct({ floor: rooms.floor })
        .from(rooms)
        .where(and(ofProperty, isNotNull(rooms.floor)))
        .orderBy(asc(rooms.floor))
    ]);

    res.status(200).json({
      room_types: types.map(({ room_type }) => room_type),
      floors: floors.map(({ floor }) => floor)
    });
  }
);

const getRoomById = handle('Failed to fetch room', async (req, res) => {
  const propertyId = req.selectedPropertyId ?? null;
  const room = propertyId
    ? await findRoom(propertyId, Number(req.params.id))
    : undefined;
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.status(200).json(transformRoom(room));
});

const createRoom = handle('Failed to create room', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  const { room_number, name, room_type, floor, status } =
    req.body as CreateRoomData;

  try {
    const [created] = await db
      .insert(rooms)
      .values({
        property_id: propertyId,
        room_number,
        name: name || room_number,
        room_type,
        floor: floor ?? null,
        status: status ?? 'available'
      })
      .returning({ id: rooms.id });

    const room = await findRoom(propertyId, created.id);
    res.status(201).json(transformRoom(room));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json(conflict('ROOM_NUMBER_TAKEN'));
    }
    throw error;
  }
});

const updateRoom = handle('Failed to update room', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  const roomId = Number(req.params.id);
  const existing = await findRoom(propertyId, roomId);
  if (!existing) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const { name, ...rest } = (req.body ?? {}) as UpdateRoomData;
  const updates = {
    ...rest,
    // An emptied name falls back to the room number
    ...(name !== undefined && {
      name: name || rest.room_number || existing.room_number
    })
  };

  // Renaming would cut the reservation loose from its room
  if (
    updates.name !== undefined &&
    updates.name !== existing.name &&
    existing.has_active_reservation
  ) {
    return res.status(409).json(conflict('ROOM_HAS_ACTIVE_RESERVATION'));
  }

  try {
    await db
      .update(rooms)
      .set({ ...updates, updated_at: new Date() })
      .where(inProperty(propertyId, roomId));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json(conflict('ROOM_NUMBER_TAKEN'));
    }
    throw error;
  }

  const room = await findRoom(propertyId, roomId);
  res.status(200).json(transformRoom(room));
});

const deleteRoom = handle('Failed to delete room', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  const roomId = Number(req.params.id);
  // The check rides in the delete itself, so a reservation made a moment
  // ago still blocks it
  const [deleted] = await db
    .delete(rooms)
    .where(and(inProperty(propertyId, roomId), not(hasActiveReservation)))
    .returning({ id: rooms.id });

  if (!deleted) {
    const room = await findRoom(propertyId, roomId);
    return room
      ? res.status(409).json(conflict('ROOM_HAS_ACTIVE_RESERVATION'))
      : res.status(404).json({ error: 'Room not found' });
  }

  res.status(200).json({ message: 'Room deleted successfully' });
});

export {
  createRoom,
  deleteRoom,
  getRoomById,
  getRoomFilterOptions,
  getRooms,
  updateRoom
};
