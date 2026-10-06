import { describe, expect, test } from 'vitest';

import { isNavPathDisabled, visibleNavGroups } from './nav-items';

describe('visibleNavGroups', () => {
  test('shows everything when nothing is disabled', () => {
    const ids = visibleNavGroups([]).flatMap((g) => g.items.map((i) => i.to));
    expect(ids).toContain('/rooms');
    expect(ids).toContain('/payment-provider');
  });

  test('removes disabled items and keeps Start', () => {
    const groups = visibleNavGroups(['monitoring', 'rooms']);
    const paths = groups.flatMap((g) => g.items.map((i) => i.to));
    expect(paths).not.toContain('/rooms');
    expect(paths).not.toContain('/monitoring');
    expect(paths).toContain('/');
    expect(paths).toContain('/reservations');
  });

  test('drops a group once all its items are disabled', () => {
    const groups = visibleNavGroups(['guest-abc', 'products']);
    expect(groups.map((g) => g.key)).toEqual([
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
