import sanitizeHtml from 'sanitize-html';

// The HTML a CMS text may contain: what the app renders natively. Narrower
// than shared/rich-text.ts — images go to the gallery, headings are H2/H3.
export const cmsAllowedTags = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'a'
];

// Dropped with their content instead of kept as text.
const nonTextTags = ['script', 'style', 'textarea', 'option', 'noscript'];

const options: sanitizeHtml.IOptions = {
  allowedTags: cmsAllowedTags,
  allowedAttributes: { a: ['href'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  nonTextTags
};

/**
 * Whether a CMS text has anything a guest would read: markup, whitespace
 * and the empty paragraph an editor leaves behind don't count.
 */
export function cmsHasText(html: string) {
  return (
    sanitizeHtml(html, {
      allowedTags: [],
      allowedAttributes: {},
      nonTextTags
    }).trim() !== ''
  );
}

// The one sanitizer for a CMS text: the server runs it on save, the preview
// on every render, so the preview shows exactly what gets stored.
// Returns '' when no text is left.
export function sanitizeCmsHtml(html: string) {
  const clean = sanitizeHtml(html, options).trim();
  return cmsHasText(clean) ? clean : '';
}
