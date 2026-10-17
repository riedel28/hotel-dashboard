import { z } from 'zod';

// The property's image store, which CMS nodes and events refer to. Each
// feature uploads through its own endpoint with its own size limit.

/** Lowercase, with the dot: what the store accepts. */
export const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

export const imageIdParamsSchema = z.object({ id: z.uuid() });
