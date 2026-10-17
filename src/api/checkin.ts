import { queryOptions } from '@tanstack/react-query';
import {
  type CheckinSettings,
  checkinSettingsSchema,
  type SaveCheckinSettingsData,
  saveCheckinSettingsSchema
} from 'shared/types/checkin';

import { client, handleApiError } from './client';
import { uploadImage } from './images';

// The server scopes this to the caller's selected property; the id is in the
// key so that switching property never shows the previous one's settings.
export function checkinSettingsQueryOptions(propertyId: string | null) {
  return queryOptions({
    queryKey: ['checkin-settings', propertyId],
    queryFn: fetchCheckinSettings
  });
}

async function fetchCheckinSettings(): Promise<CheckinSettings> {
  try {
    const response = await client.get('/checkin-settings');
    return checkinSettingsSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchCheckinSettings');
  }
}

export async function saveCheckinSettings(
  data: SaveCheckinSettingsData
): Promise<CheckinSettings> {
  try {
    const validated = saveCheckinSettingsSchema.parse(data);
    const response = await client.put('/checkin-settings', validated);
    return checkinSettingsSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'saveCheckinSettings');
  }
}

export async function setCheckinEnabled(
  enabled: boolean
): Promise<CheckinSettings> {
  try {
    const response = await client.put('/checkin-settings/enabled', { enabled });
    return checkinSettingsSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'setCheckinEnabled');
  }
}

export const uploadCheckinBackground = (file: File) =>
  uploadImage('/checkin-settings/background', file);
