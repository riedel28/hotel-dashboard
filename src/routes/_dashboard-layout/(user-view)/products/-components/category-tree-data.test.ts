import { describe, expect, it } from 'vitest';

import {
  buildTreeItems,
  categoryLineage,
  filterCategories,
  rootItemId
} from './category-tree-data';

// Mini-bar ─ Drinks ─ Water
//          └ Snacks
// Spa
const categories = [
  { id: 1, title: 'Mini-bar', parent_id: null },
  { id: 2, title: 'Drinks', parent_id: 1 },
  { id: 3, title: 'Snacks', parent_id: 1 },
  { id: 4, title: 'Water', parent_id: 2 },
  { id: 5, title: 'Spa', parent_id: null }
];
const titles = (list: typeof categories) => list.map((c) => c.title);

describe('buildTreeItems', () => {
  it('nests categories under their parents in list order', () => {
    expect(buildTreeItems(categories)).toEqual({
      [rootItemId]: { name: rootItemId, children: ['1', '5'] },
      '1': { name: 'Mini-bar', children: ['2', '3'] },
      '2': { name: 'Drinks', children: ['4'] },
      '3': { name: 'Snacks' },
      '4': { name: 'Water' },
      '5': { name: 'Spa' }
    });
  });

  it('has an empty root for no categories', () => {
    expect(buildTreeItems([])).toEqual({
      [rootItemId]: { name: rootItemId, children: [] }
    });
  });

  it('leaves out a category whose parent is not in the list', () => {
    const items = buildTreeItems([{ id: 4, title: 'Water', parent_id: 2 }]);
    expect(items[rootItemId]?.children).toEqual([]);
  });
});

describe('categoryLineage', () => {
  it('lists the category, then its ancestors, nearest first', () => {
    expect(titles(categoryLineage(categories, 4))).toEqual([
      'Water',
      'Drinks',
      'Mini-bar'
    ]);
  });

  it('is just the category at the top level', () => {
    expect(titles(categoryLineage(categories, 5))).toEqual(['Spa']);
  });

  it('is empty for an unknown id', () => {
    expect(categoryLineage(categories, 99)).toEqual([]);
  });
});

describe('filterCategories', () => {
  it('keeps a match with the ancestors leading to it', () => {
    expect(titles(filterCategories(categories, 'water'))).toEqual([
      'Mini-bar',
      'Drinks',
      'Water'
    ]);
  });

  it('keeps the whole subtree of a match', () => {
    expect(titles(filterCategories(categories, 'drinks'))).toEqual([
      'Mini-bar',
      'Drinks',
      'Water'
    ]);
  });

  it('keeps everything under a matching top-level category', () => {
    expect(titles(filterCategories(categories, 'mini'))).toEqual([
      'Mini-bar',
      'Drinks',
      'Snacks',
      'Water'
    ]);
  });

  it('matches case-insensitively against a lower-cased query', () => {
    expect(titles(filterCategories(categories, 'spa'))).toEqual(['Spa']);
  });

  it('returns nothing when no title matches', () => {
    expect(filterCategories(categories, 'zzz')).toEqual([]);
  });
});
