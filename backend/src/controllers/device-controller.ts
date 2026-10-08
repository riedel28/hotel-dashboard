import { and, asc, eq, isNull, sql } from 'drizzle-orm';

import type {
  AssignDeviceRoomData,
  ClaimDeviceData,
  DeviceClaimErrorCode
} from '../../../shared/types/devices';
import { db } from '../db/pool';
import { devices, rooms } from '../db/schema';
import { withFailMessage } from '../middleware/error';
import {
  requireSelectedProperty,
  type SelectedPropertyRequest
} from '../middleware/selected-property';
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

function findBySerial(serialNumber: string) {
  return db
    .select({ id: devices.id, pin_hash: devices.pin_hash })
    .from(devices)
    .where(eq(sql`lower(${devices.serial_number})`, serialNumber.toLowerCase()))
    .then(([device]) => device);
}

type KnownDevice = NonNullable<Awaited<ReturnType<typeof findBySerial>>>;

// What a claim puts on the device
interface ClaimAssignment {
  property_id: string;
  room_id: number | null;
  name: string | null;
}

// How a claim ends: the id of the device now owned by the property, or the
// code of the reason it is not.
type ClaimOutcome = { id: number } | DeviceClaimErrorCode;

const claimErrors: Record<
  DeviceClaimErrorCode,
  { status: number; error: string }
> = {
  INVALID_PIN: { status: 422, error: 'Invalid PIN' },
  DEVICE_ALREADY_CLAIMED: {
    status: 409,
    error: 'Device has already been added'
  }
};

// Takes a device that is already registered. The PIN is checked before
// ownership, so whether the device is already claimed is only revealed to
// someone holding its PIN.
async function claimKnownDevice(
  device: KnownDevice,
  pin: string,
  assignment: ClaimAssignment
): Promise<ClaimOutcome> {
  if (!(await comparePassword(pin, device.pin_hash))) {
    return 'INVALID_PIN';
  }

  // The `property_id IS NULL` guard makes concurrent claims of one device
  // resolve to a single winner.
  const [claimed] = await db
    .update(devices)
    .set({ ...assignment, updated_at: new Date() })
    .where(and(eq(devices.id, device.id), isNull(devices.property_id)))
    .returning({ id: devices.id });
  return claimed ?? 'DEVICE_ALREADY_CLAIMED';
}

// Registers a serial number nobody has yet: the device is new, and the PIN
// entered now becomes its PIN.
// ponytail: nothing proves the caller holds this device — a property can take
// any unused serial number. Have devices register themselves (serial + PIN)
// and reject unknown serials here once they can.
async function claimNewDevice(
  serialNumber: string,
  pin: string,
  assignment: ClaimAssignment
): Promise<ClaimOutcome> {
  const [created] = await db
    .insert(devices)
    .values({
      ...assignment,
      serial_number: serialNumber,
      pin_hash: await hashPassword(pin)
    })
    .onConflictDoNothing()
    .returning({ id: devices.id });
  if (created) return created;

  // Lost a race for the serial number: it is a known device now and goes
  // through the same checks as one.
  const winner = await findBySerial(serialNumber);
  return winner
    ? claimKnownDevice(winner, pin, assignment)
    : 'DEVICE_ALREADY_CLAIMED';
}

const claimDevice = handle('Failed to add device', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  const { serial_number, pin, name, room_id } = req.body as ClaimDeviceData;

  const [isRoomValid, known] = await Promise.all([
    room_id == null || roomExists(room_id, propertyId),
    findBySerial(serial_number)
  ]);
  if (!isRoomValid) {
    return res.status(400).json({ error: 'Room not found' });
  }

  const assignment = {
    property_id: propertyId,
    room_id: room_id ?? null,
    name: name || null
  };
  const outcome = known
    ? await claimKnownDevice(known, pin, assignment)
    : await claimNewDevice(serial_number, pin, assignment);
  if (typeof outcome === 'string') {
    const { status, error } = claimErrors[outcome];
    return res.status(status).json({ error, code: outcome });
  }

  const [row] = await findDevices(propertyId, outcome.id);
  res.status(201).json(transformDevice(row));
});

const assignDeviceRoom = handle('Failed to update device', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
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
