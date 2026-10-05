import sanitizeHtml from 'sanitize-html';

// The formatting the rich-text editor offers: headings (H1–H6), bold, italic,
// underline, lists, links and images by URL. Everything else is stripped — the editor's own restrictions are
// only a UI, a client can send any HTML.
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'br',
    'strong',
    'em',
    'u',
    'ul',
    'ol',
    'li',
    'a',
    'img'
  ],
  allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  // No data: URIs — an inline image would not fit the length limit anyway.
  allowedSchemesByTag: { img: ['http', 'https'] },
  // Links always open in a new tab without access to the opener.
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      target: '_blank',
      rel: 'noopener noreferrer'
    })
  }
};

// Sanitized HTML, or null when neither text nor an image is left.
export function sanitizeRichText(html: string | null | undefined) {
  if (html == null) return null;
  const clean = sanitizeHtml(html, options).trim();
  const hasContent =
    clean.includes('<img src=') ||
    sanitizeHtml(clean, { allowedTags: [], allowedAttributes: {} }).trim() !==
      '';
  return hasContent ? clean : null;
}
