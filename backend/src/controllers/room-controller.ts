import { and, asc, desc, eq, ilike, or } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { db } from '../db/pool';
import { rooms as roomsTable } from '../db/schema';

async function getRooms(req: Request, res: Response) {
  try {
    const { page, per_page, q, property_id, status, sort_by, sort_order } =
      req.query;

    const conditions = [];

    // Search condition
    if (q) {
      conditions.push(
        or(
          ilike(roomsTable.name, `%${q}%`),
          ilike(roomsTable.room_number, `%${q}%`),
          ilike(roomsTable.room_type, `%${q}%`)
        )
      );
    }

    // Property filter
    if (property_id) {
      conditions.push(eq(roomsTable.property_id, property_id as string));
    }

    // Status filter
    if (status) {
      conditions.push(eq(roomsTable.status, status as string));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // Build dynamic orderBy clause
    const sortColumn = sort_by as
      | 'name'
      | 'room_number'
      | 'room_type'
      | 'status'
      | undefined;
    const sortDirection = sort_order as 'asc' | 'desc' | undefined;

    let orderByColumn;
    switch (sortColumn) {
      case 'name':
        orderByColumn = roomsTable.name;
        break;
      case 'room_number':
        orderByColumn = roomsTable.room_number;
        break;
      case 'room_type':
        orderByColumn = roomsTable.room_type;
        break;
      case 'status':
        orderByColumn = roomsTable.status;
        break;
      default:
        orderByColumn = roomsTable.name;
    }

    const orderBy =
      sortDirection === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    const pageNum = Number(page) || 1;
    const perPageNum = Number(per_page) || 10;
    const offset = (pageNum - 1) * perPageNum;

    // Get paginated rooms
    const rooms = await db
      .select()
      .from(roomsTable)
      .where(whereCondition)
      .orderBy(orderBy)
      .limit(perPageNum)
      .offset(offset);

    // Get total count for pagination
    const allRooms = await db
      .select({ id: roomsTable.id })
      .from(roomsTable)
      .where(whereCondition);
    const totalCount = allRooms.length;

    // Transform database records to match API schema
    const transformedRooms = rooms.map((room) => ({
      id: room.id,
      name: room.name,
      property_id: room.property_id,
      room_number: room.room_number,
      room_type: room.room_type,
      status: room.status,
      created_at: room.created_at?.toISOString() ?? null,
      updated_at: room.updated_at?.toISOString() ?? null
    }));

    res.status(200).json({
      index: transformedRooms,
      page: pageNum,
      per_page: perPageNum,
      total: totalCount,
      page_count: Math.ceil(totalCount / perPageNum)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
}

async function createRoom(req: Request, res: Response) {
  try {
    const { name, property_id, room_number, room_type, status } = req.body;

    const [newRoom] = await db
      .insert(roomsTable)
      .values({
        name,
        property_id: property_id || null,
        room_number: room_number || null,
        room_type: room_type || null,
        status: status || 'available'
      })
      .returning();

    if (!newRoom) {
      return res.status(500).json({ error: 'Failed to create room' });
    }

    // Transform database record to match API schema
    const transformedRoom = {
      id: newRoom.id,
      name: newRoom.name,
      property_id: newRoom.property_id,
      room_number: newRoom.room_number,
      room_type: newRoom.room_type,
      status: newRoom.status,
      created_at: newRoom.created_at?.toISOString() ?? null,
      updated_at: newRoom.updated_at?.toISOString() ?? null
    };

    res.status(201).json(transformedRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create room' });
  }
}

async function getRoomById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const roomId = Number(id);

    const room = await db.query.rooms.findFirst({
      where: eq(roomsTable.id, roomId)
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Transform database record to match API schema
    const transformedRoom = {
      id: room.id,
      name: room.name,
      property_id: room.property_id,
      room_number: room.room_number,
      room_type: room.room_type,
      status: room.status,
      created_at: room.created_at?.toISOString() ?? null,
      updated_at: room.updated_at?.toISOString() ?? null
    };

    res.status(200).json(transformedRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
}

async function updateRoom(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body ?? {};
    const roomId = Number(id);

    const [updatedRoom] = await db
      .update(roomsTable)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(roomsTable.id, roomId))
      .returning();

    if (!updatedRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Transform database record to match API schema
    const transformedRoom = {
      id: updatedRoom.id,
      name: updatedRoom.name,
      property_id: updatedRoom.property_id,
      room_number: updatedRoom.room_number,
      room_type: updatedRoom.room_type,
      status: updatedRoom.status,
      created_at: updatedRoom.created_at?.toISOString() ?? null,
      updated_at: updatedRoom.updated_at?.toISOString() ?? null
    };

    res.status(200).json(transformedRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update room' });
  }
}

async function deleteRoom(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const roomId = Number(id);

    const room = await db.query.rooms.findFirst({
      where: eq(roomsTable.id, roomId)
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    await db.delete(roomsTable).where(eq(roomsTable.id, roomId));

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
}

export { getRooms, createRoom, getRoomById, updateRoom, deleteRoom };

