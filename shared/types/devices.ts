import { z } from 'zod';

// Connection status is derived from the last signal: online below the first
// threshold, recently offline up to the second, offline beyond it or when the
// device never reported.
export const DEVICE_ONLINE_THRESHOLD_MS = 15 * 60 * 1000;
export const DEVICE_OFFLINE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export const DEVICE_PIN_LENGTH = 12;

export const deviceConnectionStatusSchema = z.enum([
  'online',
  'recently_offline',
  'offline'
]);

// Codes of the claim errors a form field can show; anything else is general.
export const deviceClaimErrorCodeSchema = z.enum([
  'SERIAL_NOT_FOUND',
  'INVALID_PIN',
  'DEVICE_ALREADY_CLAIMED'
]);

export const deviceRoomSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  room_number: z.string().nullable()
});

export const deviceSchema = z.object({
  id: z.number().int().positive(),
  serial_number: z.string(),
  name: z.string().nullable(),
  room: deviceRoomSchema.nullable(),
  last_seen_at: z.string().datetime().nullable(),
  app_version: z.string().nullable()
});

export const claimDeviceSchema = z.object({
  serial_number: z.string().trim().min(1, 'Serial number is required'),
  pin: z
    .string()
    .regex(
      new RegExp(`^\\d{${DEVICE_PIN_LENGTH}}$`),
      `PIN must be ${DEVICE_PIN_LENGTH} digits`
    ),
  name: z.string().trim().max(100).optional(),
  room_id: z.number().int().positive().nullable().optional()
});

// null unassigns the device from its room
export const assignDeviceRoomSchema = z.object({
  room_id: z.number().int().positive().nullable()
});

export const deviceIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export type DeviceConnectionStatus = z.infer<
  typeof deviceConnectionStatusSchema
>;
export type DeviceClaimErrorCode = z.infer<typeof deviceClaimErrorCodeSchema>;
export type DeviceRoom = z.infer<typeof deviceRoomSchema>;
export type Device = z.infer<typeof deviceSchema>;
export type ClaimDeviceData = z.infer<typeof claimDeviceSchema>;
export type AssignDeviceRoomData = z.infer<typeof assignDeviceRoomSchema>;
