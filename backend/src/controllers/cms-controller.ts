import { extname } from 'node:path';

import { and, asc, eq, inArray, lt, notExists, sql } from 'drizzle-orm';
import type { Response } from 'express';
import type { z } from 'zod';

import { sanitizeCmsHtml } from '../../../shared/cms-html';
import {
  cmsChildren,
  cmsDescendantIds,
  cmsMoveError,
  cmsReorder
} from '../../../shared/cms-tree';
import {
  type CmsLocale,
  cmsLocales,
  type CmsNode,
  cmsPrimaryLocale,
  type CmsTranslation,
  type createCmsNodeSchema,
  type MoveCmsNodeData,
  type saveCmsNodeSchema,
  type setCmsNodeVisibilitySchema
} from '../../../shared/types/cms';
import { db } from '../db/pool';
import {
  cmsImages,
  cmsNodeImages,
  cmsNodes,
  cmsNodeTranslations
} from '../db/schema';
import {
  HttpProblem,
  isForeignKeyViolation,
  withFailMessage
} from '../middleware/error';
import {
  requireSelectedProperty,
  type SelectedPropertyRequest
} from '../middleware/selected-property';

// Property scope is resolved by attachSelectedProperty. Without a selected
// property the list is empty and writes are 400.
const handle = withFailMessage<SelectedPropertyRequest>;

type Executor = Pick<typeof db, 'select'>;
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const imageMimes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
};

const copySuffix: Record<CmsLocale, string> = {
  de: ' (Kopie)',
  en: ' (copy)'
};

/** The property's nodes (or the one with `id`) with translations and images. */
async function loadNodes(
  ex: Executor,
  propertyId: string,
  id?: number
): Promise<CmsNode[]> {
  const nodes = await ex
    .select()
    .from(cmsNodes)
    .where(
      and(
        eq(cmsNodes.property_id, propertyId),
        id === undefined ? undefined : eq(cmsNodes.id, id)
      )
    )
    .orderBy(asc(cmsNodes.position), asc(cmsNodes.id));
  const ids = nodes.map((node) => node.id);
  if (ids.length === 0) return [];

  const [translations, images] = await Promise.all([
    ex
      .select()
      .from(cmsNodeTranslations)
      .where(inArray(cmsNodeTranslations.node_id, ids)),
    ex
      .select()
      .from(cmsNodeImages)
      .where(inArray(cmsNodeImages.node_id, ids))
      .orderBy(asc(cmsNodeImages.position))
  ]);

  return nodes.map((node) => ({
    id: node.id,
    parent_id: node.parent_id,
    position: node.position,
    type: node.type,
    hidden: node.hidden,
    url: node.url,
    open_mode: node.open_mode,
    image_ids: images
      .filter((image) => image.node_id === node.id)
      .map((image) => image.image_id),
    translations: Object.fromEntries(
      translations
        .filter((row) => row.node_id === node.id)
        .map(({ locale, title, subtitle, body, url }) => [
          locale,
          { title, subtitle, body, url }
        ])
    ),
    updated_at: node.updated_at.toISOString()
  }));
}

/**
 * The property's nodes locked for the rest of the transaction, so concurrent
 * moves can't each pass the cycle check and form a loop together.
 */
function lockNodes(tx: Tx, propertyId: string) {
  return tx
    .select({
      id: cmsNodes.id,
      parent_id: cmsNodes.parent_id,
      type: cmsNodes.type,
      hidden: cmsNodes.hidden,
      position: cmsNodes.position
    })
    .from(cmsNodes)
    .where(eq(cmsNodes.property_id, propertyId))
    .orderBy(asc(cmsNodes.position), asc(cmsNodes.id))
    .for('update');
}

// Images nobody refers to: abandoned uploads, replaced or removed ones and
// those of deleted nodes. A day of grace keeps an upload alive while it sits
// in an unsaved form.
function sweepImages(
  ex: Pick<typeof db, 'delete' | 'select'>,
  propertyId: string
) {
  return ex.delete(cmsImages).where(
    and(
      eq(cmsImages.property_id, propertyId),
      lt(cmsImages.created_at, sql`now() - interval '1 day'`),
      notExists(
        ex
          .select({ one: sql`1` })
          .from(cmsNodeImages)
          .where(eq(cmsNodeImages.image_id, cmsImages.id))
      )
    )
  );
}

const moveErrors = {
  parent_not_found: 'Parent not found',
  parent_is_link: 'A link cannot have nested items',
  cycle: 'A node cannot be moved into itself or its descendants'
};

const nodeNotFound = () => new HttpProblem(404, 'Node not found');
const imageNotFound = () => new HttpProblem(400, 'Image not found');

async function sendNode(
  res: Response,
  status: number,
  propertyId: string,
  id: number
) {
  const [node] = await loadNodes(db, propertyId, id);
  if (!node) throw nodeNotFound();
  res.status(status).json(node);
}

const getCmsNodes = handle('Failed to fetch content', async (req, res) => {
  const propertyId = req.selectedPropertyId ?? null;
  res.status(200).json(propertyId ? await loadNodes(db, propertyId) : []);
});

// New nodes start hidden: guests shouldn't see a page while it's written.
const createCmsNode = handle('Failed to create node', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  const { parent_id, type, title, url, open_mode } = req.body as z.output<
    typeof createCmsNodeSchema
  >;

  const id = await db.transaction(async (tx) => {
    const rows = await lockNodes(tx, propertyId);
    const error = cmsMoveError(rows, -1, parent_id);
    if (error) throw new HttpProblem(400, moveErrors[error]);

    const siblings = cmsChildren(rows, parent_id);
    const [node] = await tx
      .insert(cmsNodes)
      .values({
        property_id: propertyId,
        parent_id,
        position: Math.max(-1, ...siblings.map((row) => row.position)) + 1,
        type,
        hidden: true,
        url: type === 'link' ? url : null,
        open_mode: type === 'link' ? (open_mode ?? 'in_app') : null
      })
      .returning({ id: cmsNodes.id });
    await tx
      .insert(cmsNodeTranslations)
      .values({ node_id: node!.id, locale: cmsPrimaryLocale, title });
    return node!.id;
  });
  await sendNode(res, 201, propertyId, id);
});

// The editor form, written as a whole: type, URL, translations and images.
const saveCmsNode = handle('Failed to save node', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  const id = Number(req.params.id);
  const data = req.body as z.output<typeof saveCmsNodeSchema>;
  const isLink = data.type === 'link';

  await db
    .transaction(async (tx) => {
      const [node] = await tx
        .select()
        .from(cmsNodes)
        .where(and(eq(cmsNodes.id, id), eq(cmsNodes.property_id, propertyId)))
        .for('update');
      if (!node) throw nodeNotFound();
      if (node.updated_at.toISOString() !== data.updated_at) {
        throw new HttpProblem(
          409,
          'The node was changed by someone else',
          'STALE'
        );
      }
      if (isLink) {
        const [child] = await tx
          .select({ id: cmsNodes.id })
          .from(cmsNodes)
          .where(eq(cmsNodes.parent_id, id))
          .limit(1);
        if (child) {
          throw new HttpProblem(
            409,
            'Move or delete the nested items before making this a link',
            'HAS_CHILDREN'
          );
        }
      }

      const imageIds = [...new Set(data.image_ids)];
      if (imageIds.length > 0) {
        const owned = await tx
          .select({ id: cmsImages.id })
          .from(cmsImages)
          .where(
            and(
              eq(cmsImages.property_id, propertyId),
              inArray(cmsImages.id, imageIds)
            )
          );
        if (owned.length !== imageIds.length) throw imageNotFound();
      }

      await tx
        .update(cmsNodes)
        .set({
          type: data.type,
          url: isLink ? data.url : null,
          open_mode: isLink ? data.open_mode : null,
          updated_at: new Date()
        })
        .where(eq(cmsNodes.id, id));

      // A link has no text, a page no URL override. A locale with nothing
      // left has no row, which is what "not translated" means.
      const rows = cmsLocales.flatMap((locale) => {
        const t: CmsTranslation | undefined = data.translations[locale];
        if (!t) return [];
        const row = {
          node_id: id,
          locale,
          title: t.title,
          subtitle: t.subtitle,
          body: isLink ? null : sanitizeCmsHtml(t.body ?? '') || null,
          url: isLink ? t.url : null
        };
        const empty = !row.title && !row.subtitle && !row.body && !row.url;
        return empty && locale !== cmsPrimaryLocale ? [] : [row];
      });
      await tx
        .delete(cmsNodeTranslations)
        .where(eq(cmsNodeTranslations.node_id, id));
      await tx.insert(cmsNodeTranslations).values(rows);

      await tx.delete(cmsNodeImages).where(eq(cmsNodeImages.node_id, id));
      if (imageIds.length > 0) {
        await tx.insert(cmsNodeImages).values(
          imageIds.map((image_id, position) => ({
            node_id: id,
            image_id,
            position
          }))
        );
      }
    })
    // An image swept between the check and the insert (a form left open for
    // over a day) fails the foreign key: the same "not found".
    .catch((error: unknown) => {
      throw isForeignKeyViolation(error) ? imageNotFound() : error;
    });

  await sweepImages(db, propertyId);
  await sendNode(res, 200, propertyId, id);
});

// Reorder and move in one: the node goes to `index` among the children of
// `parent_id`. Leaves updated_at alone — an open form stays saveable.
const moveCmsNode = handle('Failed to move node', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  const id = Number(req.params.id);
  const { parent_id, index } = req.body as MoveCmsNodeData;

  await db.transaction(async (tx) => {
    const rows = await lockNodes(tx, propertyId);
    const node = rows.find((row) => row.id === id);
    if (!node) throw nodeNotFound();
    const error = cmsMoveError(rows, id, parent_id);
    if (error) throw new HttpProblem(400, moveErrors[error]);

    const siblings = cmsReorder(rows, node, parent_id, index);
    for (const [position, sibling] of siblings.entries()) {
      if (sibling.id === id) {
        await tx
          .update(cmsNodes)
          .set({ parent_id, position })
          .where(eq(cmsNodes.id, id));
      } else if (sibling.position !== position) {
        await tx
          .update(cmsNodes)
          .set({ position })
          .where(eq(cmsNodes.id, sibling.id));
      }
    }
  });
  await sendNode(res, 200, propertyId, id);
});

const setCmsNodeVisibility = handle(
  'Failed to change visibility',
  async (req, res) => {
    const propertyId = requireSelectedProperty(req, res);
    if (!propertyId) return;

    const id = Number(req.params.id);
    const [updated] = await db
      .update(cmsNodes)
      .set({
        hidden: (req.body as z.output<typeof setCmsNodeVisibilitySchema>).hidden
      })
      .where(and(eq(cmsNodes.id, id), eq(cmsNodes.property_id, propertyId)))
      .returning({ id: cmsNodes.id });
    if (!updated) throw nodeNotFound();
    await sendNode(res, 200, propertyId, id);
  }
);

// A deep copy right after the original. The copy itself starts hidden (its
// descendants keep their flags), so the duplicate isn't live at once.
const duplicateCmsNode = handle(
  'Failed to duplicate node',
  async (req, res) => {
    const propertyId = requireSelectedProperty(req, res);
    if (!propertyId) return;

    const id = Number(req.params.id);

    const copyId = await db.transaction(async (tx) => {
      await lockNodes(tx, propertyId);
      const nodes = await loadNodes(tx, propertyId);
      const original = nodes.find((node) => node.id === id);
      if (!original) throw nodeNotFound();

      // Make room right after the original.
      await tx
        .update(cmsNodes)
        .set({ position: sql`${cmsNodes.position} + 1` })
        .where(
          and(
            eq(cmsNodes.property_id, propertyId),
            original.parent_id == null
              ? sql`${cmsNodes.parent_id} IS NULL`
              : eq(cmsNodes.parent_id, original.parent_id),
            sql`${cmsNodes.position} > ${original.position}`
          )
        );

      // The branch, the original first. Its ids are drawn up front, so the
      // copy goes in with one insert per table however big it is (a node at
      // a time cost a few round trips each).
      const branch = [
        original,
        ...cmsDescendantIds(nodes, id).map((descendant) =>
          nodes.find((node) => node.id === descendant)!
        )
      ];
      const { rows } = await tx.execute<{ id: string }>(sql`
        SELECT nextval(pg_get_serial_sequence('cms_nodes', 'id')) AS id
        FROM generate_series(1, ${branch.length})
      `);
      const copyOf = new Map(
        branch.map((node, index) => [node.id, Number(rows[index]!.id)])
      );
      const newId = (node: CmsNode) => copyOf.get(node.id)!;

      await tx
        .insert(cmsNodes)
        .overridingSystemValue()
        .values(
          branch.map((node) => {
            const isRoot = node === original;
            return {
              id: newId(node),
              property_id: propertyId,
              parent_id: isRoot ? node.parent_id : copyOf.get(node.parent_id!)!,
              position: isRoot ? node.position + 1 : node.position,
              type: node.type,
              hidden: isRoot ? true : node.hidden,
              url: node.url,
              open_mode: node.open_mode
            };
          })
        );

      const translations = branch.flatMap((node) =>
        cmsLocales.flatMap((locale) => {
          const t = node.translations[locale];
          if (!t) return [];
          const title =
            node === original && t.title
              ? `${t.title}${copySuffix[locale]}`
              : t.title;
          return [{ ...t, title, node_id: newId(node), locale }];
        })
      );
      if (translations.length > 0) {
        await tx.insert(cmsNodeTranslations).values(translations);
      }
      const images = branch.flatMap((node) =>
        node.image_ids.map((image_id, position) => ({
          node_id: newId(node),
          image_id,
          position
        }))
      );
      if (images.length > 0) {
        await tx.insert(cmsNodeImages).values(images);
      }
      return newId(original);
    });

    await sendNode(res, 201, propertyId, copyId);
  }
);

// Deletes the node with its whole subtree (ON DELETE CASCADE).
const deleteCmsNode = handle('Failed to delete node', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  const [deleted] = await db
    .delete(cmsNodes)
    .where(
      and(
        eq(cmsNodes.id, Number(req.params.id)),
        eq(cmsNodes.property_id, propertyId)
      )
    )
    .returning({ id: cmsNodes.id });
  if (!deleted) throw nodeNotFound();
  await sweepImages(db, propertyId);
  res.status(200).json({ message: 'Node deleted successfully' });
});

const uploadCmsImage = handle('Failed to upload image', async (req, res) => {
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
const getCmsImage = handle('Failed to fetch image', async (req, res) => {
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

export {
  createCmsNode,
  deleteCmsNode,
  duplicateCmsNode,
  getCmsImage,
  getCmsNodes,
  moveCmsNode,
  saveCmsNode,
  setCmsNodeVisibility,
  uploadCmsImage
};
