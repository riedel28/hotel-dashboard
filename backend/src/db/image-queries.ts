import { and, eq, inArray, lt, notExists, sql } from 'drizzle-orm';

import { HttpProblem, isForeignKeyViolation } from '../middleware/error';
import { db } from './pool';
import {
  checkinSettings,
  cmsImages,
  cmsNodeImages,
  eventImages
} from './schema';

// The property's image store (cms_images): uploads served publicly by id and
// referred to, in order, by CMS nodes and events.

type Executor = Pick<typeof db, 'select' | 'delete'>;

// Every table that refers to an image: the sweep keeps what any of them names.
const imageReferences = [
  { table: cmsNodeImages, imageId: cmsNodeImages.image_id },
  { table: eventImages, imageId: eventImages.image_id },
  { table: checkinSettings, imageId: checkinSettings.custom_image_id }
];

export const imageNotFound = () =>
  new HttpProblem(400, 'Image not found', 'IMAGE_NOT_FOUND');

/** Refuses ids that are not images of the property. */
export async function assertImagesOwned(
  ex: Pick<typeof db, 'select'>,
  propertyId: string,
  ids: string[]
) {
  if (ids.length === 0) return;
  const owned = await ex
    .select({ id: cmsImages.id })
    .from(cmsImages)
    .where(
      and(eq(cmsImages.property_id, propertyId), inArray(cmsImages.id, ids))
    );
  if (owned.length !== new Set(ids).size) throw imageNotFound();
}

/**
 * For a write's catch: an image swept between the ownership check and the
 * insert (a form left open for over a day) fails the foreign key, which is
 * the same "not found".
 */
export function rethrowGoneImage(error: unknown): never {
  throw isForeignKeyViolation(error) ? imageNotFound() : error;
}

/**
 * Deletes images nobody refers to: abandoned uploads, replaced or removed
 * ones, those of deleted nodes and events. A day of grace keeps an upload
 * alive while it sits in an unsaved form.
 */
export function sweepImages(ex: Executor, propertyId: string) {
  return ex.delete(cmsImages).where(
    and(
      eq(cmsImages.property_id, propertyId),
      lt(cmsImages.created_at, sql`now() - interval '1 day'`),
      ...imageReferences.map(({ table, imageId }) =>
        notExists(
          ex
            .select({ one: sql`1` })
            .from(table)
            .where(eq(imageId, cmsImages.id))
        )
      )
    )
  );
}
