import { z } from 'zod';

// The content guests see in the hotel's mobile app: a tree of nodes per
// property. Structure (tree, order, type, images, visibility) is shared by
// every language; titles, subtitles, text and the URL override are per locale.

// The first locale is the primary one: required, and the fallback for every
// other locale field by field.
export const cmsLocales = ['de', 'en'] as const;
export const cmsPrimaryLocale = cmsLocales[0];
export const cmsLocaleSchema = z.enum(cmsLocales);

export const cmsNodeTypeSchema = z.enum(['page', 'link']);
// How the app opens a link: its in-app browser or the system browser.
export const cmsOpenModeSchema = z.enum(['in_app', 'system']);

export const cmsSubtitleMaxLength = 80;
export const cmsImageMaxBytes = 2 * 1024 * 1024;
export const cmsImageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

const idSchema = z.number().int().positive();

// http(s) only: the app hands the URL to a browser.
export const cmsUrlSchema = z
  .string()
  .trim()
  .min(1, 'URL is required')
  .pipe(z.url({ protocol: /^https?$/, message: 'Enter an http(s) URL' }));

// Empty strings are stored as null, so "not translated" has one shape.
const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => (value === '' ? null : value))
    .nullable();

export const cmsTranslationSchema = z.object({
  title: optionalText(200, 'Title must be at most 200 characters'),
  subtitle: optionalText(
    cmsSubtitleMaxLength,
    `Subtitle must be at most ${cmsSubtitleMaxLength} characters`
  ),
  // HTML; the server sanitizes it on write. The limit counts the markup.
  body: optionalText(20_000, 'Text is too long'),
  url: z
    .union([z.literal(''), cmsUrlSchema])
    .transform((value) => (value === '' ? null : value))
    .nullable()
});

const translationsSchema = z.object({
  de: cmsTranslationSchema,
  en: cmsTranslationSchema.optional()
});

export const cmsNodeSchema = z.object({
  id: idSchema,
  parent_id: idSchema.nullable(),
  position: z.number().int(),
  type: cmsNodeTypeSchema,
  hidden: z.boolean(),
  url: z.string().nullable(),
  open_mode: cmsOpenModeSchema.nullable(),
  // Gallery of a page in order; at most one (the icon) for a link.
  image_ids: z.array(z.uuid()),
  translations: z.object({
    de: cmsTranslationSchema.optional(),
    en: cmsTranslationSchema.optional()
  }),
  updated_at: z.string()
});

export const fetchCmsNodesResponseSchema = z.array(cmsNodeSchema);

export const createCmsNodeSchema = z
  .object({
    parent_id: idSchema.nullable(),
    type: cmsNodeTypeSchema,
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(200, 'Title must be at most 200 characters'),
    url: cmsUrlSchema.optional(),
    open_mode: cmsOpenModeSchema.optional()
  })
  .refine((data) => data.type === 'page' || data.url !== undefined, {
    message: 'URL is required',
    path: ['url']
  });

// The editor form, saved as a whole. `updated_at` is the version the form
// was loaded from; a newer one on the server answers 409.
export const saveCmsNodeSchema = z
  .object({
    type: cmsNodeTypeSchema,
    url: z.string().nullable(),
    open_mode: cmsOpenModeSchema.nullable(),
    image_ids: z.array(z.uuid()).max(30),
    translations: translationsSchema,
    updated_at: z.string()
  })
  .superRefine((data, ctx) => {
    if (!data.translations.de.title) {
      ctx.addIssue({
        code: 'custom',
        message: 'Title is required',
        path: ['translations', 'de', 'title']
      });
    }
    if (data.type === 'link') {
      if (!cmsUrlSchema.safeParse(data.url ?? '').success) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter an http(s) URL',
          path: ['url']
        });
      }
      if (!data.open_mode) {
        ctx.addIssue({
          code: 'custom',
          message: 'Choose how the link opens',
          path: ['open_mode']
        });
      }
      if (data.image_ids.length > 1) {
        ctx.addIssue({
          code: 'custom',
          message: 'A link has at most one image',
          path: ['image_ids']
        });
      }
    }
  });

export const moveCmsNodeSchema = z.object({
  parent_id: idSchema.nullable(),
  // Position among the new siblings, the moved node left out.
  index: z.number().int().min(0)
});

export const setCmsNodeVisibilitySchema = z.object({ hidden: z.boolean() });

export const cmsNodeIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const cmsImageIdParamsSchema = z.object({ id: z.uuid() });

export type CmsLocale = z.infer<typeof cmsLocaleSchema>;
export type CmsNodeType = z.infer<typeof cmsNodeTypeSchema>;
export type CmsOpenMode = z.infer<typeof cmsOpenModeSchema>;
export type CmsTranslation = z.infer<typeof cmsTranslationSchema>;
export type CmsNode = z.infer<typeof cmsNodeSchema>;
export type CreateCmsNodeData = z.input<typeof createCmsNodeSchema>;
export type SaveCmsNodeData = z.input<typeof saveCmsNodeSchema>;
export type MoveCmsNodeData = z.infer<typeof moveCmsNodeSchema>;
