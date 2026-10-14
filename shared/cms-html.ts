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

const options: sanitizeHtml.IOptions = {
  allowedTags: cmsAllowedTags,
  allowedAttributes: { a: ['href'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  // Drop <script>/<style> with their content instead of keeping it as text.
  nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript']
};

// The one sanitizer for a CMS text: the server runs it on save, the preview
// on every render, so the preview shows exactly what gets stored.
// Returns '' when no text is left.
export function sanitizeCmsHtml(html: string) {
  const clean = sanitizeHtml(html, options).trim();
  return sanitizeHtml(clean, { allowedTags: [], allowedAttributes: {} }).trim()
    ? clean
    : '';
}
