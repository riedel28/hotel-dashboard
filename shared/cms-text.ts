// Kept apart from cms-html.ts: the editor checks text on every keystroke and
// shouldn't load (or wait for) sanitize-html to do it.

// What a guest doesn't read: the tags, the content of those the sanitizer
// drops whole, and blanks (\s covers the no-break space too).
const unread =
  /<(script|style|textarea|option|noscript)\b[\s\S]*?<\/\1\s*>|<[^>]*>|&nbsp;|&#160;|\s/gi;

/**
 * Whether a CMS text has anything a guest would read: markup, whitespace
 * and the empty paragraph an editor leaves behind don't count.
 */
export function cmsHasText(html: string) {
  return html.replace(unread, '') !== '';
}
