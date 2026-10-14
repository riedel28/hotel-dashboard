import sanitizeHtml from 'sanitize-html';
import { describe, expect, it } from 'vitest';

import { sanitizeCmsHtml } from './cms-html';
import { cmsHasText } from './cms-text';

describe('sanitizeCmsHtml', () => {
  it('keeps the formats the app renders', () => {
    const html =
      '<h2>Spa</h2><h3>Zeiten</h3><p><strong>a</strong> <em>b</em> <u>c</u><br /></p>' +
      '<ul><li>x</li></ul><ol><li>y</li></ol><p><a href="https://x.de">l</a></p>';
    expect(sanitizeCmsHtml(html)).toBe(html);
  });

  it('drops scripts, handlers and unsafe links', () => {
    expect(
      sanitizeCmsHtml(
        '<p onclick="steal()">Hi<script>alert(1)</script></p><a href="javascript:alert(1)">x</a>'
      )
    ).toBe('<p>Hi</p><a>x</a>');
  });

  it('unwraps what the app has no style for', () => {
    expect(
      sanitizeCmsHtml(
        '<h1>Big</h1><div style="color:red">t</div><img src="https://x/y.png">'
      )
    ).toBe('Bigt');
  });

  it('returns an empty string when no text is left', () => {
    expect(sanitizeCmsHtml('<p></p><p><br></p>')).toBe('');
    expect(sanitizeCmsHtml('<img src="https://x/y.png">')).toBe('');
  });
});

describe('cmsHasText', () => {
  it('ignores markup, blanks and what the sanitizer drops', () => {
    expect(cmsHasText('<p></p>')).toBe(false);
    expect(cmsHasText('<p>&nbsp; </p><br>')).toBe(false);
    expect(cmsHasText('<script>alert(1)</script>')).toBe(false);
    expect(cmsHasText('<p>Hallo</p>')).toBe(true);
    expect(cmsHasText('AT&T')).toBe(true);
    expect(cmsHasText('<p>a &lt; b</p>')).toBe(true);
  });
  it('agrees with what sanitize-html leaves as text', () => {
    const samples = [
      '<p></p>',
      '<p>&nbsp;</p>',
      '<p>\u00a0</p>',
      '<br><ul><li></li></ul>',
      '<style>p { color: red }</style>',
      '<script>alert(1)</script><p> </p>',
      '<p>Hallo</p>',
      '<p>&amp;</p>',
      '<h2>Öffnungszeiten</h2>'
    ];
    for (const html of samples) {
      const text = sanitizeHtml(html, {
        allowedTags: [],
        allowedAttributes: {}
      }).trim();
      expect(cmsHasText(html), html).toBe(text !== '');
    }
  });
});
