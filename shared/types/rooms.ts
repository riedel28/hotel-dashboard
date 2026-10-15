import { z } from 'zod';

import { perPageSchema, sortOrderSchema } from './list-params';

export const roomStatusSchema = z.enum([
  'available',
  'occupied',
  'maintenance',
  'out_of_order'
]);

export const roomSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  property_id: z.string().uuid(),
  room_number: z.string().min(1),
  room_type: z.string().nullable(),
  floor: z.number().int().nullable(),
  status: roomStatusSchema.default('available'),
  // A reservation names its room; while one is active the room can be neither
  // deleted nor renamed
  has_active_reservation: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// A repeated query key arrives as an array, a single one as a string
const listOf = <T extends z.ZodType>(item: T) =>
  z.preprocess(
    (value) => (value === undefined || Array.isArray(value) ? value : [value]),
    z.array(item).optional()
  );

export const roomSortColumns = [
  'room_number',
  'name',
  'room_type',
  'floor',
  'status'
] as const;

export const fetchRoomsParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: perPageSchema.default(10),
  q: z.string().optional(),
  status: roomStatusSchema.optional(),
  // '' stands for rooms without a type
  room_type: listOf(z.string()),
  floor: listOf(z.coerce.number().int()),
  sort_by: z.enum(roomSortColumns).optional(),
  sort_order: sortOrderSchema.optional()
});

export const fetchRoomsResponseSchema = z.object({
  index: z.array(roomSchema),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  page_count: z.number().int().nonnegative()
});

// The types and floors the property's rooms use, for the filters and the form
export const roomFilterOptionsSchema = z.object({
  room_types: z.array(z.string()),
  floors: z.array(z.number().int())
});

// The property comes from the caller's selected property, never the body.
// An empty name is stored as the room number.
export const createRoomSchema = z.object({
  room_number: z.string().trim().min(1, 'Room number is required'),
  name: z.string().trim().optional(),
  room_type: z.string().trim().min(1, 'Room type is required'),
  floor: z.number().int().nullable().optional(),
  status: roomStatusSchema.optional()
});

export const updateRoomSchema = createRoomSchema.partial();

const roomErrorCodeSchema = z.enum([
  'ROOM_NUMBER_TAKEN',
  'ROOM_HAS_ACTIVE_RESERVATION'
]);

export const roomIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

// Type exports
export type RoomStatus = z.infer<typeof roomStatusSchema>;
export type Room = z.infer<typeof roomSchema>;
// What a caller passes: page and per_page may be left to their defaults
export type FetchRoomsParams = z.input<typeof fetchRoomsParamsSchema>;
export type ParsedRoomsParams = z.output<typeof fetchRoomsParamsSchema>;
export type FetchRoomsResponse = z.infer<typeof fetchRoomsResponseSchema>;
export type RoomFilterOptions = z.infer<typeof roomFilterOptionsSchema>;
export type RoomErrorCode = z.infer<typeof roomErrorCodeSchema>;
export type CreateRoomData = z.infer<typeof createRoomSchema>;
export type UpdateRoomData = z.infer<typeof updateRoomSchema>;
