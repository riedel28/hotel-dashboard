import { extname } from 'node:path';

import { eq } from 'drizzle-orm';

import { db } from '../db/pool';
import { cmsImages } from '../db/schema';
import { HttpProblem, withFailMessage } from '../middleware/error';
import {
  requireSelectedProperty,
  type SelectedPropertyRequest
} from '../middleware/selected-property';

// The image store's own endpoints; each feature mounts the upload behind its
// own size limit (see upload()).

const handle = withFailMessage<SelectedPropertyRequest>;

const imageMimes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
};

const uploadImage = handle('Failed to upload image', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  // upload() has checked the size and the extension.
  const file = req.file!;
  const [image] = await db
    .insert(cmsImages)
    .values({
      property_id: propertyId,
      mime: imageMimes[extname(file.originalname).toLowerCase()]!,
      data: file.buffer
    })
    .returning({ id: cmsImages.id });
  res.status(201).json({ id: image!.id });
});

// Public: the app shows these to guests. Ids are random UUIDs and an image
// never changes, so it may be cached for good.
const getImage = handle('Failed to fetch image', async (req, res) => {
  const [image] = await db
    .select({ mime: cmsImages.mime, data: cmsImages.data })
    .from(cmsImages)
    .where(eq(cmsImages.id, String(req.params.id)));
  if (!image) throw new HttpProblem(404, 'Image not found');
  res
    .status(200)
    .set({
      'Content-Type': image.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      // The admin and the app load it from another origin.
      'Cross-Origin-Resource-Policy': 'cross-origin'
    })
    .send(image.data);
});

export { getImage, uploadImage };
