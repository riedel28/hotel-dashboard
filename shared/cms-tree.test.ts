import { describe, expect, it } from 'vitest';

import { cmsDescendantIds, cmsMoveError, cmsVisibility } from './cms-tree';

// root ─┬─ restaurant ─── menu ─── drinks
//       └─ website (link)
//  spa
const nodes = [
  { id: 1, parent_id: null, type: 'page' as const, hidden: false },
  { id: 2, parent_id: 1, type: 'page' as const, hidden: false },
  { id: 3, parent_id: 2, type: 'page' as const, hidden: false },
  { id: 4, parent_id: 3, type: 'page' as const, hidden: false },
  { id: 5, parent_id: 1, type: 'link' as const, hidden: false },
  { id: 6, parent_id: null, type: 'page' as const, hidden: false }
];

const withHidden = (...ids: number[]) =>
  nodes.map((node) => ({ ...node, hidden: ids.includes(node.id) }));

describe('cmsDescendantIds', () => {
  it('lists the whole branch, nearest first', () => {
    expect(cmsDescendantIds(nodes, 1)).toEqual([2, 5, 3, 4]);
    expect(cmsDescendantIds(nodes, 4)).toEqual([]);
  });
});

describe('cmsMoveError', () => {
  it('allows the top level and any other page', () => {
    expect(cmsMoveError(nodes, 3, null)).toBeNull();
    expect(cmsMoveError(nodes, 3, 6)).toBeNull();
    expect(cmsMoveError(nodes, 2, 1)).toBeNull();
  });

  it('refuses the node itself and its descendants', () => {
    expect(cmsMoveError(nodes, 2, 2)).toBe('cycle');
    expect(cmsMoveError(nodes, 2, 3)).toBe('cycle');
    expect(cmsMoveError(nodes, 1, 4)).toBe('cycle');
  });

  it('refuses a link or an unknown parent', () => {
    expect(cmsMoveError(nodes, 6, 5)).toBe('parent_is_link');
    expect(cmsMoveError(nodes, 6, 99)).toBe('parent_not_found');
  });
});

describe('cmsVisibility', () => {
  it('is visible without any hidden flag on the way up', () => {
    expect(cmsVisibility(nodes, 4)).toEqual({ state: 'visible' });
  });

  it("reports the node's own flag first", () => {
    expect(cmsVisibility(withHidden(1, 3), 3)).toEqual({ state: 'hidden' });
  });

  it('names the nearest hidden ancestor', () => {
    expect(cmsVisibility(withHidden(1, 2), 4)).toEqual({
      state: 'hidden_by_parent',
      ancestorId: 2
    });
  });

  it('restores the branch when the ancestor is shown again', () => {
    // The child's own flag was never touched by hiding the parent.
    const hidden = withHidden(1, 3);
    expect(cmsVisibility(hidden, 4).state).toBe('hidden_by_parent');
    const shownAgain = hidden.map((n) =>
      n.id === 1 ? { ...n, hidden: false } : n
    );
    expect(cmsVisibility(shownAgain, 2)).toEqual({ state: 'visible' });
    expect(cmsVisibility(shownAgain, 4)).toEqual({
      state: 'hidden_by_parent',
      ancestorId: 3
    });
  });
});
