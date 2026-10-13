import { useQuery } from '@tanstack/react-query';
import type { Room } from 'shared/types/rooms';

import { roomByIdQueryOptions } from '@/api/rooms';

/**
 * The room form's state from what the URL says is open: 'new' for an empty
 * form, a room id for editing. The room is normally on the page already; a
 * link to one that is not gets it from the API, and the form opens once it
 * has arrived.
 */
export function useEditingRoom(
  target: number | 'new' | undefined,
  listed: Room[]
) {
  const roomId = typeof target === 'number' ? target : undefined;
  const onPage = listed.find((room) => room.id === roomId);
  const { data: fetched } = useQuery({
    ...roomByIdQueryOptions(roomId ?? 0),
    enabled: roomId !== undefined && !onPage
  });
  const room = roomId === undefined ? undefined : (onPage ?? fetched);

  return { isOpen: target === 'new' || room !== undefined, room };
}
