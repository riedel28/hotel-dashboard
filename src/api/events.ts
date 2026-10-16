import {
  keepPreviousData,
  type QueryClient,
  queryOptions
} from '@tanstack/react-query';
import {
  eventSchema,
  type FetchEventsParams,
  fetchEventsParamsSchema,
  type FetchEventsResponse,
  fetchEventsResponseSchema,
  type HotelEvent,
  type SaveEventData,
  saveEventSchema
} from 'shared/types/events';
import { z } from 'zod';

import { client, handleApiError } from './client';

export type { HotelEvent };

// Every key starts with 'events', so invalidating that prefix refreshes the
// list and a single event alike.
export function eventsQueryOptions(params: FetchEventsParams) {
  return queryOptions({
    queryKey: ['events', 'list', params],
    queryFn: () => fetchEvents(params),
    placeholderData: keepPreviousData
  });
}

async function fetchEvents(
  params: FetchEventsParams
): Promise<FetchEventsResponse> {
  try {
    const response = await client.get('/events', {
      params: fetchEventsParamsSchema.parse(params),
      // Lists as repeated keys (category=a&category=b), which the API reads
      paramsSerializer: { indexes: null }
    });
    return fetchEventsResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchEvents');
  }
}

export function eventByIdQueryOptions(id: number) {
  return queryOptions({
    queryKey: ['events', id],
    queryFn: () => fetchEventById(id)
  });
}

async function fetchEventById(id: number): Promise<HotelEvent> {
  try {
    const response = await client.get(`/events/${id}`);
    return eventSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchEventById');
  }
}

export function invalidateEvents(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ['events'] });
}

export async function createEvent(data: SaveEventData): Promise<HotelEvent> {
  try {
    const response = await client.post('/events', saveEventSchema.parse(data));
    return eventSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'createEvent');
  }
}

export async function updateEvent(
  id: number,
  data: SaveEventData
): Promise<HotelEvent> {
  try {
    const response = await client.put(
      `/events/${id}`,
      saveEventSchema.parse(data)
    );
    return eventSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'updateEvent');
  }
}

export async function deleteEvent(id: number): Promise<void> {
  try {
    await client.delete(`/events/${id}`);
  } catch (err) {
    handleApiError(err, 'deleteEvent');
  }
}

/** Into the CMS image store; shown with `cmsImageUrl`. */
export async function uploadEventImage(file: File): Promise<string> {
  try {
    const body = new FormData();
    body.append('file', file);
    const response = await client.post('/events/images', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60_000
    });
    return z.object({ id: z.uuid() }).parse(response.data).id;
  } catch (err) {
    handleApiError(err, 'uploadEventImage');
  }
}
