import { z } from 'zod';

// Merge adds and updates; replace also deletes the rooms the file leaves out
const roomImportModeSchema = z.enum(['merge', 'replace']);

export const ROOM_IMPORT_MAX_BYTES = 5 * 1024 * 1024;
export const ROOM_IMPORT_MAX_ROWS = 5000;
export const ROOM_IMPORT_EXTENSIONS = ['.csv', '.xlsx'];

// The file arrived (see uploads.ts for when it does not) but cannot be used
const roomImportFileErrorSchema = z.enum([
  'UNREADABLE_FILE',
  'EMPTY_FILE',
  'MISSING_COLUMNS',
  'TOO_MANY_ROWS'
]);

// One row is skipped
const roomImportRowErrorSchema = z.enum([
  'MISSING_NUMBER',
  'MISSING_TYPE',
  'INVALID_FLOOR',
  'DUPLICATE_NUMBER',
  // The room has an active reservation, which finds it by its name
  'NAME_LOCKED'
]);

const cellSchema = z.union([z.string(), z.number()]).nullable();

const roomImportRowSchema = z.object({
  // Line of the file, the header being line 1
  line: z.number().int().positive(),
  status: z.enum(['new', 'changed', 'unchanged', 'error']),
  room_number: z.string(),
  name: z.string().nullable(),
  room_type: z.string().nullable(),
  floor: z.number().int().nullable(),
  // No room of the property has this type yet: a new type, or a typo
  is_new_type: z.boolean(),
  errors: z.array(roomImportRowErrorSchema),
  changes: z.array(
    z.object({
      field: z.enum(['name', 'room_type', 'floor']),
      from: cellSchema,
      to: cellSchema
    })
  )
});

export const roomImportPreviewSchema = z.object({
  mode: roomImportModeSchema,
  // Sent back with the file to apply exactly this plan
  token: z.string(),
  summary: z.object({
    create: z.number().int(),
    update: z.number().int(),
    unchanged: z.number().int(),
    errors: z.number().int(),
    // Rooms that will be deleted; those kept by a reservation are not counted
    delete: z.number().int()
  }),
  rows: z.array(roomImportRowSchema),
  // Replace mode: the rooms the file leaves out
  deletions: z.array(
    z.object({
      id: z.number().int().positive(),
      room_number: z.string(),
      name: z.string(),
      // Kept: a room with an active reservation is never deleted
      has_active_reservation: z.boolean()
    })
  )
});

export const roomImportResultSchema = z.object({
  created: z.number().int(),
  updated: z.number().int(),
  deleted: z.number().int(),
  skipped: z.number().int()
});

export const roomImportBodySchema = z.object({
  mode: roomImportModeSchema.default('merge'),
  token: z.string().optional()
});

export type RoomImportMode = z.infer<typeof roomImportModeSchema>;
export type RoomImportBody = z.infer<typeof roomImportBodySchema>;
export type RoomImportFileError = z.infer<typeof roomImportFileErrorSchema>;
export type RoomImportRowError = z.infer<typeof roomImportRowErrorSchema>;
export type RoomImportRow = z.infer<typeof roomImportRowSchema>;
export type RoomImportPreview = z.infer<typeof roomImportPreviewSchema>;
export type RoomImportResult = z.infer<typeof roomImportResultSchema>;
