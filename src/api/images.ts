import { z } from 'zod';

import { client, handleApiError } from './client';

// The property's image store: CMS nodes and events refer to its images by id.

/** Where an uploaded image is served (publicly, for the mobile app too). */
export function imageUrl(id: string) {
  return `${import.meta.env.VITE_API_BASE_URL}/cms/images/${id}`;
}

/**
 * Uploads a file into the store through a feature's own endpoint, which
 * sets the size limit; resolves to the new image's id.
 */
export async function uploadImage(path: string, file: File): Promise<string> {
  try {
    const body = new FormData();
    body.append('file', file);
    const response = await client.post(path, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60_000
    });
    return z.object({ id: z.uuid() }).parse(response.data).id;
  } catch (err) {
    handleApiError(err, 'uploadImage');
  }
}
