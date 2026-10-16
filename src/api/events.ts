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

import { client, handleApiError } from './client';
import { uploadImage } from './images';

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

const invalidateEventLists = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: ['events', 'list'] });

/** After a create or update: its page shows it at once, lists refetch. */
export function onEventSaved(queryClient: QueryClient, event: HotelEvent) {
  queryClient.setQueryData(eventByIdQueryOptions(event.id).queryKey, event);
  return invalidateEventLists(queryClient);
}

/**
 * After a delete. Its own query is dropped rather than refetched: the
 * event's page may still be on its way out.
 */
export function onEventDeleted(queryClient: QueryClient, id: number) {
  queryClient.removeQueries({ queryKey: ['events', id], exact: true });
  return invalidateEventLists(queryClient);
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

/** Into the image store, up to the larger event limit. */
export const uploadEventImage = (file: File) =>
  uploadImage('/events/images', file);
