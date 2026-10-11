import { useQuery } from '@tanstack/react-query';

import { deviceRoomOptionsQueryOptions } from '@/api/devices';
import { roomLabel } from '@/lib/rooms';

interface RoomCellProps {
  /** The room as the reservation stores it: by name. */
  roomName: string;
}

/**
 * The room by its number. A reservation whose room is not one of the
 * property's (an imported one, say) keeps the name it was stored with.
 */
export function RoomCell({ roomName }: RoomCellProps) {
  // The room picker's list: one cached request shared by every row
  const { data: rooms = [] } = useQuery(deviceRoomOptionsQueryOptions());
  const room = rooms.find(({ name }) => name === roomName);

  return (
    <span className="block truncate tabular-nums" title={roomName}>
      {room ? roomLabel(room) : roomName}
    </span>
  );
}
