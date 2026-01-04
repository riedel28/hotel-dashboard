import { z } from 'zod';

export const roomStatusSchema = z.enum([
  'available',
  'occupied',
  'maintenance',
  'out_of_order'
]);

export const roomSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  property_id: z.string().uuid().nullable(),
  room_number: z.string().nullable(),
  room_type: z.string().nullable(),
  status: roomStatusSchema.default('available'),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable()
});

export const fetchRoomsParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  per_page: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => [5, 10, 25, 50, 100].includes(val), {
      message: 'per_page must be one of: 5, 10, 25, 50, 100'
    })
    .default(10)
    .optional(),
  q: z.string().optional(),
  property_id: z.string().uuid().optional(),
  status: roomStatusSchema.optional()
});

export const fetchRoomsResponseSchema = z.object({
  index: z.array(roomSchema),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  page_count: z.number().int().nonnegative()
});

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  property_id: z.string().uuid().nullable().optional(),
  room_number: z.string().nullable().optional(),
  room_type: z.string().nullable().optional(),
  status: roomStatusSchema.optional()
});

export const updateRoomSchema = roomSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true
  })
  .partial();

export const roomIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

// Type exports
export type RoomStatus = z.infer<typeof roomStatusSchema>;
export type Room = z.infer<typeof roomSchema>;
export type FetchRoomsParams = z.infer<typeof fetchRoomsParamsSchema>;
export type FetchRoomsResponse = z.infer<typeof fetchRoomsResponseSchema>;
export type CreateRoomData = z.infer<typeof createRoomSchema>;
export type UpdateRoomData = z.infer<typeof updateRoomSchema>;

