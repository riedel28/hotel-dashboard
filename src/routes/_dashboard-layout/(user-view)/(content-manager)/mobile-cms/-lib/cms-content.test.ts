import type { CmsNode } from 'shared/types/cms';
import { describe, expect, it } from 'vitest';

import {
  applyForm,
  filterNodes,
  formToPayload,
  isAnyTranslationMissing,
  isMissingTranslation,
  localized,
  nodeToForm,
  typeChange
} from './cms-content';

function node(overrides: Partial<CmsNode> = {}): CmsNode {
  return {
    id: 1,
    parent_id: null,
    position: 0,
    type: 'page',
    hidden: false,
    url: null,
    open_mode: null,
    image_ids: [],
    translations: {
      de: {
        title: 'Spa',
        subtitle: 'Entspannen',
        body: '<p>Text</p>',
        url: null
      }
    },
    updated_at: '2026-10-14T08:00:00.000Z',
    ...overrides
  };
}

const imageA = '0b5e7c5e-4f7a-4c55-9a39-1a2b3c4d5e6f';
const imageB = '1b5e7c5e-4f7a-4c55-9a39-1a2b3c4d5e6f';

describe('localized', () => {
  const translations = {
    de: { title: 'Frühstück', subtitle: 'Ab 7 Uhr', body: '<p>Buffet</p>' },
    en: { title: 'Breakfast', subtitle: '', body: '<p></p>' }
  };

  it('uses the locale when it has the field', () => {
    expect(localized(translations, 'en', 'title')).toEqual({
      value: 'Breakfast',
      fallback: false
    });
  });

  it('falls back to the primary locale field by field', () => {
    expect(localized(translations, 'en', 'subtitle')).toEqual({
      value: 'Ab 7 Uhr',
      fallback: true
    });
    // An editor's empty paragraph counts as empty.
    expect(localized(translations, 'en', 'body')).toEqual({
      value: '<p>Buffet</p>',
      fallback: true
    });
  });

  it('falls back when the locale has no translation at all', () => {
    expect(localized({ de: translations.de }, 'en', 'title').value).toBe(
      'Frühstück'
    );
  });

  it('is empty, not a fallback, when neither locale has it', () => {
    expect(localized({ de: { subtitle: null } }, 'en', 'subtitle')).toEqual({
      value: '',
      fallback: false
    });
  });
});

describe('isMissingTranslation', () => {
  it('flags a field filled in DE and empty in EN', () => {
    expect(
      isMissingTranslation(
        { de: { title: 'Spa', subtitle: 'Ruhe' }, en: { title: 'Spa' } },
        'en'
      )
    ).toBe(true);
  });

  it('accepts EN once every DE field is translated', () => {
    expect(
      isMissingTranslation(
        { de: { title: 'Spa', subtitle: null }, en: { title: 'Spa' } },
        'en'
      )
    ).toBe(false);
    expect(isMissingTranslation({ de: { title: 'Spa' } }, 'de')).toBe(false);
    expect(isAnyTranslationMissing({ de: { title: 'Spa' } })).toBe(true);
  });
});

describe('typeChange', () => {
  it('blocks page → link while the page has nested items', () => {
    expect(typeChange(nodeToForm(node()), 'link', 2)).toEqual({
      kind: 'blocked',
      childCount: 2
    });
  });

  it('asks before dropping the text and the gallery', () => {
    const form = nodeToForm(node({ image_ids: [imageA, imageB] }));
    expect(typeChange(form, 'link', 0)).toEqual({
      kind: 'confirm',
      hasText: true,
      imageCount: 2
    });
  });

  it('switches freely when nothing would be lost, and link → page always', () => {
    const empty = nodeToForm(
      node({
        translations: {
          de: { title: 'Spa', subtitle: null, body: null, url: null }
        }
      })
    );
    expect(typeChange(empty, 'link', 0)).toEqual({ kind: 'free' });
    const link = nodeToForm(
      node({ type: 'link', url: 'https://x.de', open_mode: 'system' })
    );
    expect(typeChange(link, 'page', 0)).toEqual({ kind: 'free' });
  });

  it('keeps the other type’s data in the form until saving', () => {
    const form = nodeToForm(node({ image_ids: [imageA] }));
    const asLink = { ...form, type: 'link' as const, url: 'https://x.de' };
    // Back to a page: text and gallery are still there.
    expect({ ...asLink, type: 'page' as const }).toEqual({
      ...form,
      url: 'https://x.de'
    });

    const payload = formToPayload(asLink, 'v1');
    expect(payload).toMatchObject({
      type: 'link',
      url: 'https://x.de',
      open_mode: 'in_app',
      image_ids: []
    });
  });
});

describe('formToPayload', () => {
  it("sends a page's gallery and a link's single image", () => {
    const page = nodeToForm(node({ image_ids: [imageB, imageA] }));
    expect(formToPayload(page, 'v1').image_ids).toEqual([imageB, imageA]);
    const link = {
      ...nodeToForm(
        node({
          type: 'link',
          url: 'https://x.de',
          open_mode: 'system',
          image_ids: [imageA]
        })
      ),
      gallery: [imageB]
    };
    expect(formToPayload(link, 'v1').image_ids).toEqual([imageA]);
  });
});

describe('applyForm', () => {
  it('shows unsaved edits in the node', () => {
    const saved = node();
    const form = nodeToForm(saved);
    form.translations.de.title = 'Wellness';
    expect(applyForm(saved, form).translations.de?.title).toBe('Wellness');
  });
});

describe('filterNodes', () => {
  const tree = [
    node({
      id: 1,
      translations: {
        de: { title: 'Restaurant', subtitle: null, body: null, url: null }
      }
    }),
    node({
      id: 2,
      parent_id: 1,
      translations: {
        de: { title: 'Speisekarte', subtitle: null, body: null, url: null },
        en: { title: 'Menu', subtitle: null, body: null, url: null }
      }
    }),
    node({
      id: 3,
      translations: {
        de: { title: 'Spa', subtitle: null, body: null, url: null },
        en: { title: 'Spa', subtitle: null, body: null, url: null }
      }
    })
  ];

  it('keeps matches with their ancestors', () => {
    const ids = (q: string, locale: 'de' | 'en') =>
      filterNodes(tree, { query: q, locale, onlyMissing: false }).map(
        (n) => n.id
      );
    expect(ids('speise', 'de')).toEqual([1, 2]);
    expect(ids('menu', 'en')).toEqual([1, 2]);
    // EN titles fall back to DE.
    expect(ids('restaurant', 'en')).toEqual([1]);
  });

  it('can show only untranslated nodes', () => {
    expect(
      filterNodes(tree, { query: '', locale: 'de', onlyMissing: true }).map(
        (n) => n.id
      )
    ).toEqual([1]);
  });
});
