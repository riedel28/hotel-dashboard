import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import {
  type CreateRoomData,
  createRoomSchema,
  type FetchRoomsParams,
  type FetchRoomsResponse,
  type Room,
  type UpdateRoomData,
  fetchRoomsParamsSchema,
  fetchRoomsResponseSchema,
  roomSchema,
  updateRoomSchema
} from 'shared/types/rooms';
import { client, handleApiError } from './client';

export function roomsQueryOptions(params: FetchRoomsParams) {
  return queryOptions({
    queryKey: [
      'rooms',
      params.page,
      params.per_page,
      params.q,
      params.property_id,
      params.status,
      params.sort_by,
      params.sort_order
    ],
    queryFn: () => fetchRooms(params),
    placeholderData: keepPreviousData
  });
}

async function fetchRooms(params: FetchRoomsParams): Promise<FetchRoomsResponse> {
  try {
    const validatedParams = fetchRoomsParamsSchema.parse(params);
    const response = await client.get('/rooms', {
      params: validatedParams
    });
    return fetchRoomsResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchRooms');
  }
}

async function createRoom(data: CreateRoomData): Promise<Room> {
  try {
    const validatedData = createRoomSchema.parse(data);
    const response = await client.post('/rooms', validatedData);
    return roomSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'createRoom');
  }
}

function roomByIdQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['rooms', id],
    queryFn: () => fetchRoomById(id)
  });
}

async function fetchRoomById(id: string): Promise<Room> {
  try {
    const response = await client.get(`/rooms/${id}`);
    return roomSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchRoomById');
  }
}

async function updateRoomById(
  id: string,
  updates: UpdateRoomData
): Promise<Room> {
  try {
    const validatedData = updateRoomSchema.parse(updates);
    const response = await client.patch(`/rooms/${id}`, validatedData);
    return roomSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'updateRoomById');
  }
}

async function deleteRoomById(id: string): Promise<void> {
  try {
    await client.delete(`/rooms/${id}`);
  } catch (err) {
    handleApiError(err, 'deleteRoomById');
  }
}

export {
  fetchRooms,
  createRoom,
  fetchRoomById,
  updateRoomById,
  deleteRoomById,
  roomByIdQueryOptions,
  fetchRoomsParamsSchema,
  createRoomSchema,
  updateRoomSchema,
  type Room
};

