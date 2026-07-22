import { queryOptions } from '@tanstack/react-query';
import {
  type CreateGuestAbcEntryData,
  createGuestAbcEntrySchema,
  fetchGuestAbcResponseSchema,
  type GuestAbcEntry,
  guestAbcEntrySchema,
  type UpdateGuestAbcEntryData,
  updateGuestAbcEntrySchema
} from 'shared/types/guest-abc';
import { client, handleApiError } from './client';

export function guestAbcQueryOptions() {
  return queryOptions({
    queryKey: ['guest-abc'],
    queryFn: fetchGuestAbcEntries,
    // Entries change rarely; keep them fresh for a while and cached longer.
    // Local changes and property switches invalidate ['guest-abc'], so a
    // generous staleTime is safe.
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30 // 30 minutes
  });
}

async function fetchGuestAbcEntries(): Promise<GuestAbcEntry[]> {
  try {
    const response = await client.get('/guest-abc');
    return fetchGuestAbcResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchGuestAbcEntries');
  }
}

async function createGuestAbcEntry(
  data: CreateGuestAbcEntryData
): Promise<GuestAbcEntry> {
  try {
    const validated = createGuestAbcEntrySchema.parse(data);
    const response = await client.post('/guest-abc', validated);
    return guestAbcEntrySchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'createGuestAbcEntry');
  }
}

async function updateGuestAbcEntry(
  id: number,
  updates: UpdateGuestAbcEntryData
): Promise<GuestAbcEntry> {
  try {
    const validated = updateGuestAbcEntrySchema.parse(updates);
    const response = await client.patch(`/guest-abc/${id}`, validated);
    return guestAbcEntrySchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'updateGuestAbcEntry');
  }
}

async function deleteGuestAbcEntry(id: number): Promise<void> {
  try {
    await client.delete(`/guest-abc/${id}`);
  } catch (err) {
    handleApiError(err, 'deleteGuestAbcEntry');
  }
}

export {
  type CreateGuestAbcEntryData,
  createGuestAbcEntry,
  createGuestAbcEntrySchema,
  deleteGuestAbcEntry,
  fetchGuestAbcEntries,
  type GuestAbcEntry,
  type UpdateGuestAbcEntryData,
  updateGuestAbcEntry
};
