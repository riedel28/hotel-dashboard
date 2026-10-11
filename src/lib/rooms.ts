import type { DeviceRoom } from 'shared/types/devices';

/** Orders labels the way a person would: "9" before "10". */
export const byLabel = new Intl.Collator(undefined, { numeric: true }).compare;

/** What a room is called in the table and the picker. */
export const roomLabel = (room: DeviceRoom) => room.room_number || room.name;

// ponytail: the floor is read off the room number — everything but its last
// two digits (204 → 2). Numbering like "A12" lands in "no floor"; add a floor
// column to rooms if a property needs that.
export function floorOf(roomNumber: string | null): number | null {
  const match = roomNumber?.trim().match(/^(\d+)\d{2}$/);
  return match ? Number(match[1]) : null;
}

/** Rooms by floor, lowest first; rooms without a floor come last. */
export function groupRoomsByFloor(rooms: DeviceRoom[]) {
  const groups = new Map<number | null, DeviceRoom[]>();
  for (const room of rooms) {
    const floor = floorOf(room.room_number);
    groups.set(floor, [...(groups.get(floor) ?? []), room]);
  }
  return [...groups]
    .sort(([a], [b]) => (a ?? Infinity) - (b ?? Infinity))
    .map(([floor, items]) => ({
      floor,
      items: items.sort((a, b) => byLabel(roomLabel(a), roomLabel(b)))
    }));
}

export function matchesRoomQuery(room: DeviceRoom, query: string) {
  const q = query.trim().toLowerCase();
  return [room.room_number, room.name].some((text) =>
    text?.toLowerCase().includes(q)
  );
}
