import type { CmsNodeType } from './types/cms';

// Tree rules of the Mobile CMS, shared by the server (which enforces them)
// and the editor (which offers only what the server will accept).

export interface CmsTreeNode {
  id: number;
  parent_id: number | null;
  type: CmsNodeType;
  hidden: boolean;
}

type Linked = Pick<CmsTreeNode, 'id' | 'parent_id'>;
type Positioned = Linked & { position: number };

/** The node's children in their order (null = the top level). */
export function cmsChildren<T extends Positioned>(
  nodes: T[],
  parentId: number | null
) {
  return nodes
    .filter((node) => node.parent_id === parentId)
    .sort((a, b) => a.position - b.position || a.id - b.id);
}

/** The node followed by its ancestors up to the top level. */
export function cmsLineage<T extends Linked>(nodes: T[], id: number) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const result: T[] = [];
  const seen = new Set<number>();
  let node = byId.get(id);
  while (node && !seen.has(node.id)) {
    seen.add(node.id);
    result.push(node);
    node = node.parent_id == null ? undefined : byId.get(node.parent_id);
  }
  return result;
}

/** Ids of the node's descendants, nearest first. */
export function cmsDescendantIds(nodes: Linked[], id: number) {
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

/**
 * The children of `parentId` once `node` is put at `index` among them (the
 * node itself left out of the count): their new order, positions 0, 1, …
 * The server writes it, the editor shows it before the server answers.
 */
export function cmsReorder<T extends Positioned>(
  nodes: T[],
  node: T,
  parentId: number | null,
  index: number
) {
  const siblings = cmsChildren(nodes, parentId).filter((n) => n.id !== node.id);
  siblings.splice(Math.min(index, siblings.length), 0, node);
  return siblings;
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
  if (cmsLineage(nodes, parentId).some((node) => node.id === nodeId))
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
  const [node, ...ancestors] = cmsLineage(nodes, id);
  if (node?.hidden) return { state: 'hidden' };
  const hiddenBy = ancestors.find((ancestor) => ancestor.hidden);
  return hiddenBy
    ? { state: 'hidden_by_parent', ancestorId: hiddenBy.id }
    : { state: 'visible' };
}
