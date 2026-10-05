import { Editor } from '@tiptap/react';
import {
  richTextAllowedAttributes,
  richTextAllowedTags
} from 'shared/rich-text';
import { describe, expect, it } from 'vitest';

import { richTextExtensions } from './rich-text-editor';

// Everything the toolbar can apply, at once.
const everything =
  [1, 2, 3, 4, 5, 6].map((level) => `<h${level}>Heading</h${level}>`).join('') +
  '<p><strong>bold</strong> <em>italic</em> <u>underline</u><br>' +
  '<a href="https://example.com">link</a></p>' +
  '<ul><li><p>item</p></li></ul><ol><li><p>item</p></li></ol>' +
  '<img src="https://example.com/a.png">';

describe('rich-text editor', () => {
  it('only produces HTML the server-side sanitizer keeps', () => {
    const editor = new Editor({
      extensions: richTextExtensions,
      content: everything
    });
    const output = new DOMParser().parseFromString(
      editor.getHTML(),
      'text/html'
    );
    editor.destroy();

    const elements = [...output.body.querySelectorAll('*')];
    // The sample survived parsing, so the checks below see every format.
    for (const tag of richTextAllowedTags) {
      expect(output.body.querySelector(tag), tag).not.toBeNull();
    }

    for (const element of elements) {
      const tag = element.tagName.toLowerCase();
      expect(richTextAllowedTags).toContain(tag);
      for (const { name } of element.attributes) {
        expect(
          richTextAllowedAttributes[tag] ?? [],
          `<${tag} ${name}>`
        ).toContain(name);
      }
    }
  });
});
