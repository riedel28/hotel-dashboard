// The HTML a rich-text field may contain: what the editor can produce and
// what the server keeps when it sanitizes. One list for both, so they can't
// drift apart (the editor test checks its output against it).
export const richTextAllowedTags = [
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
];

export const richTextAllowedAttributes: Record<string, string[]> = {
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt']
};
