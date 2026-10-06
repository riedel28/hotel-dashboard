import { describe, expect, test } from 'vitest';

import { isNavPathDisabled, userNavSections } from './nav-items';

const paths = (sections: ReturnType<typeof userNavSections>) =>
  sections.flatMap((section) => section.links.map((link) => link.to));

describe('userNavSections', () => {
  test('shows everything when nothing is disabled', () => {
    expect(paths(userNavSections([]))).toEqual([
      '/',
      '/monitoring',
      '/reservations',
      '/rooms',
      '/users',
      '/guest-abc',
      '/products',
      '/pms-provider',
      '/door-locks',
      '/payment-provider'
    ]);
  });

  test('removes disabled items and keeps Start', () => {
    const shown = paths(userNavSections(['monitoring', 'rooms']));
    expect(shown).not.toContain('/rooms');
    expect(shown).not.toContain('/monitoring');
    expect(shown).toContain('/');
    expect(shown).toContain('/reservations');
  });

  test('drops a group once all its items are disabled', () => {
    const sections = userNavSections(['guest-abc', 'products']);
    expect(sections.map((section) => section.key)).toEqual([
      'main',
      'front-office',
      'integrations'
    ]);
  });
});

describe('isNavPathDisabled', () => {
  test('matches the item page and its sub-pages only', () => {
    expect(isNavPathDisabled('/rooms', ['rooms'])).toBe(true);
    expect(isNavPathDisabled('/rooms/42/edit', ['rooms'])).toBe(true);
    expect(isNavPathDisabled('/rooms-archive', ['rooms'])).toBe(false);
    expect(isNavPathDisabled('/reservations', ['rooms'])).toBe(false);
    expect(isNavPathDisabled('/', ['rooms'])).toBe(false);
    expect(isNavPathDisabled('/rooms', [])).toBe(false);
  });
});
