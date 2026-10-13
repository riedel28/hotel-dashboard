import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import {
  type CreateRoomData,
  createRoomSchema,
  type FetchRoomsParams,
  fetchRoomsParamsSchema,
  type FetchRoomsResponse,
  fetchRoomsResponseSchema,
  type Room,
  type RoomFilterOptions,
  roomFilterOptionsSchema,
  roomSchema,
  type UpdateRoomData,
  updateRoomSchema
} from 'shared/types/rooms';

import { client, handleApiError } from './client';

// Every key starts with 'rooms', so invalidating that prefix refreshes the
// list, a single room and the filter options alike.
export function roomsQueryOptions(params: FetchRoomsParams) {
  return queryOptions({
    queryKey: ['rooms', 'list', params],
    queryFn: () => fetchRooms(params),
    placeholderData: keepPreviousData
  });
}

async function fetchRooms(
  params: FetchRoomsParams
): Promise<FetchRoomsResponse> {
  try {
    const response = await client.get('/rooms', {
      params: fetchRoomsParamsSchema.parse(params),
      // Lists as repeated keys (floor=1&floor=2), which is what the API reads
      paramsSerializer: { indexes: null }
    });
    return fetchRoomsResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchRooms');
  }
}

// The types and floors the property's rooms use
export function roomFilterOptionsQueryOptions() {
  return queryOptions({
    queryKey: ['rooms', 'filter-options'],
    queryFn: fetchRoomFilterOptions
  });
}

async function fetchRoomFilterOptions(): Promise<RoomFilterOptions> {
  try {
    const response = await client.get('/rooms/filter-options');
    return roomFilterOptionsSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchRoomFilterOptions');
  }
}

export function roomByIdQueryOptions(id: number) {
  return queryOptions({
    queryKey: ['rooms', id],
    queryFn: () => fetchRoomById(id)
  });
}

async function fetchRoomById(id: number): Promise<Room> {
  try {
    const response = await client.get(`/rooms/${id}`);
    return roomSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchRoomById');
  }
}

export async function createRoom(data: CreateRoomData): Promise<Room> {
  try {
    const response = await client.post('/rooms', createRoomSchema.parse(data));
    return roomSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'createRoom');
  }
}

export async function updateRoomById(
  id: number,
  updates: UpdateRoomData
): Promise<Room> {
  try {
    const response = await client.patch(
      `/rooms/${id}`,
      updateRoomSchema.parse(updates)
    );
    return roomSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'updateRoomById');
  }
}

export async function deleteRoomById(id: number): Promise<void> {
  try {
    await client.delete(`/rooms/${id}`);
  } catch (err) {
    handleApiError(err, 'deleteRoomById');
  }
}

export type { Room };
