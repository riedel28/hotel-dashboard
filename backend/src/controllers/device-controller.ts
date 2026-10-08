import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import type { Response } from 'express';

import type {
  AssignDeviceRoomData,
  ClaimDeviceData,
  DeviceClaimErrorCode
} from '../../../shared/types/devices';
import { db } from '../db/pool';
import { devices, rooms } from '../db/schema';
import { withFailMessage } from '../middleware/error';
import type { SelectedPropertyRequest } from '../middleware/selected-property';
import { comparePassword, hashPassword } from '../utils/password';

// Property scope is resolved by attachSelectedProperty. Without a selected
// property, lists are empty and writes are 400.
type DevicesRequest = SelectedPropertyRequest;
const handle = withFailMessage<DevicesRequest>;

const roomColumns = {
  id: rooms.id,
  name: rooms.name,
  room_number: rooms.room_number
};

// For write handlers: the selected property id, or null after answering 400.
function requireProperty(req: DevicesRequest, res: Response) {
  const propertyId = req.selectedPropertyId ?? null;
  if (!propertyId) {
    res.status(400).json({ error: 'No property selected' });
  }
  return propertyId;
}

// The property's devices with their rooms: all of them, or the one with
// `deviceId`.
function findDevices(propertyId: string, deviceId?: number) {
  return db
    .select({
      id: devices.id,
      serial_number: devices.serial_number,
      name: devices.name,
      last_seen_at: devices.last_seen_at,
      app_version: devices.app_version,
      room: roomColumns
    })
    .from(devices)
    .leftJoin(rooms, eq(devices.room_id, rooms.id))
    .where(
      and(
        eq(devices.property_id, propertyId),
        deviceId === undefined ? undefined : eq(devices.id, deviceId)
      )
    )
    .orderBy(asc(devices.id));
}

type DeviceRow = Awaited<ReturnType<typeof findDevices>>[number];

function transformDevice(device: DeviceRow) {
  return {
    ...device,
    last_seen_at: device.last_seen_at?.toISOString() ?? null
  };
}

// Whether the room belongs to the property; a device can only be assigned to
// a room of its own property.
async function roomExists(roomId: number, propertyId: string) {
  const [room] = await db
    .select({ id: rooms.id })
    .from(rooms)
    .where(and(eq(rooms.id, roomId), eq(rooms.property_id, propertyId)));
  return Boolean(room);
}

const getDevices = handle('Failed to fetch devices', async (req, res) => {
  const propertyId = req.selectedPropertyId ?? null;
  if (!propertyId) {
    return res.status(200).json([]);
  }

  const rows = await findDevices(propertyId);
  res.status(200).json(rows.map(transformDevice));
});

// Every room of the property, for the room picker. The rooms list endpoint is
// paginated, and the picker needs them all at once.
const getDeviceRoomOptions = handle(
  'Failed to fetch rooms',
  async (req, res) => {
    const propertyId = req.selectedPropertyId ?? null;
    if (!propertyId) {
      return res.status(200).json([]);
    }

    const options = await db
      .select(roomColumns)
      .from(rooms)
      .where(eq(rooms.property_id, propertyId))
      .orderBy(asc(rooms.room_number), asc(rooms.name));
    res.status(200).json(options);
  }
);

function claimError(
  res: Response,
  status: number,
  code: DeviceClaimErrorCode,
  error: string
) {
  return res.status(status).json({ error, code });
}

const claimDevice = handle('Failed to add device', async (req, res) => {
  const propertyId = requireProperty(req, res);
  if (!propertyId) return;

  const { serial_number, pin, name, room_id } = req.body as ClaimDeviceData;

  if (room_id != null && !(await roomExists(room_id, propertyId))) {
    return res.status(400).json({ error: 'Room not found' });
  }
  const assignment = {
    property_id: propertyId,
    room_id: room_id ?? null,
    name: name || null
  };

  const findBySerial = async () => {
    const [found] = await db
      .select({ id: devices.id, pin_hash: devices.pin_hash })
      .from(devices)
      .where(
        eq(sql`lower(${devices.serial_number})`, serial_number.toLowerCase())
      );
    return found;
  };

  let device = await findBySerial();
  let claimed: { id: number } | undefined;
  if (!device) {
    // A serial number nobody registered yet: the device is new, and the PIN
    // entered now becomes its PIN.
    // ponytail: nothing proves the caller holds this device — a property can
    // take any unused serial number. Have devices register themselves (serial
    // + PIN) and reject unknown serials here once they can.
    [claimed] = await db
      .insert(devices)
      .values({
        ...assignment,
        serial_number,
        pin_hash: await hashPassword(pin)
      })
      .onConflictDoNothing()
      .returning({ id: devices.id });
    // Lost a race for the same serial number: it is a known device now and
    // goes through the same checks as one.
    if (!claimed) {
      device = await findBySerial();
    }
  }
  if (!claimed && device) {
    // The PIN is checked before ownership, so whether a known device is
    // already claimed is only revealed to someone holding its PIN.
    if (!(await comparePassword(pin, device.pin_hash))) {
      return claimError(res, 422, 'INVALID_PIN', 'Invalid PIN');
    }

    // The `property_id IS NULL` guard makes concurrent claims of one device
    // resolve to a single winner.
    [claimed] = await db
      .update(devices)
      .set({ ...assignment, updated_at: new Date() })
      .where(and(eq(devices.id, device.id), isNull(devices.property_id)))
      .returning({ id: devices.id });
  }
  if (!claimed) {
    return claimError(
      res,
      409,
      'DEVICE_ALREADY_CLAIMED',
      'Device has already been added'
    );
  }

  const [row] = await findDevices(propertyId, claimed.id);
  res.status(201).json(transformDevice(row));
});

const assignDeviceRoom = handle('Failed to update device', async (req, res) => {
  const propertyId = requireProperty(req, res);
  if (!propertyId) return;

  const deviceId = Number(req.params.id);
  const { room_id } = req.body as AssignDeviceRoomData;

  if (room_id !== null && !(await roomExists(room_id, propertyId))) {
    return res.status(400).json({ error: 'Room not found' });
  }

  const [updated] = await db
    .update(devices)
    .set({ room_id, updated_at: new Date() })
    .where(and(eq(devices.id, deviceId), eq(devices.property_id, propertyId)))
    .returning({ id: devices.id });
  if (!updated) {
    return res.status(404).json({ error: 'Device not found' });
  }

  const [row] = await findDevices(propertyId, updated.id);
  res.status(200).json(transformDevice(row));
});

export { assignDeviceRoom, claimDevice, getDeviceRoomOptions, getDevices };
