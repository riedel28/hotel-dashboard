import { describe, expect, test } from 'vitest';

import { paginate } from './paginate';

describe('paginate', () => {
  const rows = [1, 2, 3, 4, 5];

  test('slices a page and counts the pages', () => {
    expect(paginate(rows, 1, 2)).toEqual({
      rows: [3, 4],
      pageIndex: 1,
      pageSize: 2,
      pageCount: 3,
      totalCount: 5
    });
  });

  test('falls back to the last page when the index is out of range', () => {
    expect(paginate(rows, 7, 2)).toMatchObject({ pageIndex: 2, rows: [5] });
    expect(paginate([], 3, 2)).toMatchObject({
      pageIndex: 0,
      pageCount: 1,
      rows: []
    });
  });
});
