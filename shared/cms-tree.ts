import type { CmsNodeType } from './types/cms';

// Tree rules of the Mobile CMS, shared by the server (which enforces them)
// and the editor (which offers only what the server will accept).

export interface CmsTreeNode {
  id: number;
  parent_id: number | null;
  type: CmsNodeType;
  hidden: boolean;
}

/** Ids of the node's descendants, nearest first. */
export function cmsDescendantIds(nodes: CmsTreeNode[], id: number) {
  const childrenOf = new Map<number, number[]>();
  for (const node of nodes) {
    if (node.parent_id == null) continue;
    childrenOf.set(node.parent_id, [
      ...(childrenOf.get(node.parent_id) ?? []),
      node.id
    ]);
  }
  const result: number[] = [];
  const queue = [...(childrenOf.get(id) ?? [])];
  const seen = new Set<number>();
  while (queue.length > 0) {
    const next = queue.shift()!;
    if (seen.has(next)) continue;
    seen.add(next);
    result.push(next);
    queue.push(...(childrenOf.get(next) ?? []));
  }
  return result;
}

export type CmsMoveError = 'parent_not_found' | 'parent_is_link' | 'cycle';

/**
 * Why `nodeId` can't go under `parentId` (null = top level), or null if it
 * can: the parent must exist, be a page, and be neither the node itself nor
 * one of its descendants.
 */
export function cmsMoveError(
  nodes: CmsTreeNode[],
  nodeId: number,
  parentId: number | null
): CmsMoveError | null {
  if (parentId == null) return null;
  const parent = nodes.find((node) => node.id === parentId);
  if (!parent) return 'parent_not_found';
  if (parent.type === 'link') return 'parent_is_link';
  if (parentId === nodeId || cmsDescendantIds(nodes, nodeId).includes(parentId))
    return 'cycle';
  return null;
}

export type CmsVisibility =
  | { state: 'visible' }
  | { state: 'hidden' }
  // Not flagged itself, but under a hidden ancestor: the nearest one.
  | { state: 'hidden_by_parent'; ancestorId: number };

/**
 * Whether guests see the node. Its own flag wins; otherwise the nearest
 * hidden ancestor hides it. Flags are never copied down, so showing the
 * ancestor again restores the branch exactly as it was.
 */
export function cmsVisibility(nodes: CmsTreeNode[], id: number): CmsVisibility {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const node = byId.get(id);
  if (node?.hidden) return { state: 'hidden' };
  const seen = new Set<number>([id]);
  let current = node?.parent_id ?? null;
  while (current != null && !seen.has(current)) {
    seen.add(current);
    const ancestor = byId.get(current);
    if (!ancestor) break;
    if (ancestor.hidden) {
      return { state: 'hidden_by_parent', ancestorId: ancestor.id };
    }
    current = ancestor.parent_id;
  }
  return { state: 'visible' };
}
