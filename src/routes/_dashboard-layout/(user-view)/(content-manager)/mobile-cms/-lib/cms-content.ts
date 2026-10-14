import { cmsLineage } from 'shared/cms-tree';
import {
  type CmsLocale,
  cmsLocales,
  type CmsNode,
  type CmsNodeType,
  type CmsOpenMode,
  cmsPrimaryLocale,
  type SaveCmsNodeData
} from 'shared/types/cms';

// The editor's logic, kept out of the components so it can be tested.

export const translatableFields = ['title', 'subtitle', 'body'] as const;
type TranslatableField = (typeof translatableFields)[number];

export interface CmsFormTranslation {
  title: string;
  subtitle: string;
  body: string;
  // Overrides the node's URL in this locale; '' = none.
  url: string;
}

// The editor form. It holds both the page's and the link's fields, so
// switching the type back and forth before saving loses nothing; what the
// other type doesn't have is dropped only when saving (formToPayload).
export interface CmsForm {
  type: CmsNodeType;
  url: string;
  open_mode: CmsOpenMode;
  // A page's gallery, in order.
  gallery: string[];
  // A link's optional image.
  icon: string | null;
  translations: Record<CmsLocale, CmsFormTranslation>;
}

export function nodeToForm(node: CmsNode): CmsForm {
  const translation = (locale: CmsLocale): CmsFormTranslation => {
    const t = node.translations[locale];
    return {
      title: t?.title ?? '',
      subtitle: t?.subtitle ?? '',
      body: t?.body ?? '',
      url: t?.url ?? ''
    };
  };
  return {
    type: node.type,
    url: node.url ?? '',
    open_mode: node.open_mode ?? 'in_app',
    gallery: node.type === 'page' ? node.image_ids : [],
    icon: node.type === 'link' ? (node.image_ids[0] ?? null) : null,
    translations: { de: translation('de'), en: translation('en') }
  };
}

/**
 * The form as the server takes it: the current type's image(s), URL and
 * open mode. The translations go as typed — the server drops what the type
 * doesn't have and stores an empty secondary locale as untranslated.
 */
export function formToPayload(
  form: CmsForm,
  updatedAt: string
): SaveCmsNodeData {
  const isLink = form.type === 'link';
  return {
    type: form.type,
    url: isLink ? form.url.trim() : null,
    open_mode: isLink ? form.open_mode : null,
    image_ids: isLink ? (form.icon ? [form.icon] : []) : form.gallery,
    translations: form.translations,
    updated_at: updatedAt
  };
}

// An empty editor still reports '<p></p>' in places; count only real text.
function isBlank(value: string | null | undefined) {
  return !value || value.replace(/<[^>]*>|&nbsp;|\s/g, '') === '';
}

/** Whether a locale has anything in it at all. */
export function hasText(t: Partial<CmsFormTranslation> | undefined) {
  return !!t && (Object.values(t) as string[]).some((value) => !isBlank(value));
}

type Translations = Partial<
  Record<CmsLocale, Partial<Record<TranslatableField | 'url', string | null>>>
>;

/**
 * A field in `locale`, falling back to the primary locale field by field —
 * what the app and the preview show. `fallback` tells the latter happened.
 */
export function localized(
  translations: Translations,
  locale: CmsLocale,
  field: TranslatableField | 'url'
) {
  const own = translations[locale]?.[field];
  if (!isBlank(own)) return { value: own!, fallback: false };
  const primary = translations[cmsPrimaryLocale]?.[field];
  return {
    value: isBlank(primary) ? '' : primary!,
    fallback: locale !== cmsPrimaryLocale && !isBlank(primary)
  };
}

/**
 * Whether `locale` lacks a translation the primary locale has: some field
 * filled in the primary locale and empty in this one.
 */
export function isMissingTranslation(
  translations: Translations,
  locale: CmsLocale
) {
  if (locale === cmsPrimaryLocale) return false;
  return translatableFields.some(
    (field) =>
      !isBlank(translations[cmsPrimaryLocale]?.[field]) &&
      isBlank(translations[locale]?.[field])
  );
}

/** Whether any locale lacks a translation: the tree's marker and filter. */
export function isAnyTranslationMissing(translations: Translations) {
  return cmsLocales.some((locale) =>
    isMissingTranslation(translations, locale)
  );
}

export type TypeChange =
  // Nothing to lose.
  | { kind: 'free' }
  // Page → link with nested items: not allowed.
  | { kind: 'blocked'; childCount: number }
  // Page → link: text and gallery are dropped on save.
  | { kind: 'confirm'; hasText: boolean; imageCount: number };

/** What switching the form to `to` means. */
export function typeChange(
  form: CmsForm,
  to: CmsNodeType,
  childCount: number
): TypeChange {
  if (to === form.type || to === 'page') return { kind: 'free' };
  if (childCount > 0) return { kind: 'blocked', childCount };
  const hasBody = Object.values(form.translations).some(
    (t) => !isBlank(t.body)
  );
  if (!hasBody && form.gallery.length === 0) return { kind: 'free' };
  return {
    kind: 'confirm',
    hasText: hasBody,
    imageCount: form.gallery.length
  };
}

/** A saved node with the form's unsaved state, for the preview. */
export function applyForm(node: CmsNode, form: CmsForm): CmsNode {
  return { ...node, ...formToPayload(form, node.updated_at) };
}

/**
 * The nodes a filtered tree shows: those matching (title in `locale`, with
 * fallback, containing `query`; and/or missing a translation), plus their
 * ancestors so each match keeps its path.
 */
export function filterNodes(
  nodes: CmsNode[],
  {
    query,
    locale,
    onlyMissing
  }: { query: string; locale: CmsLocale; onlyMissing: boolean }
) {
  const needle = query.trim().toLocaleLowerCase();
  const keep = new Set<number>();
  for (const node of nodes) {
    const title = localized(node.translations, locale, 'title').value;
    const matches =
      (!needle || title.toLocaleLowerCase().includes(needle)) &&
      (!onlyMissing || isAnyTranslationMissing(node.translations));
    if (matches) {
      for (const n of cmsLineage(nodes, node.id)) keep.add(n.id);
    }
  }
  return nodes.filter((node) => keep.has(node.id));
}
