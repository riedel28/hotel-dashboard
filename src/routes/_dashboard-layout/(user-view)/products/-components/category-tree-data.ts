import type { NestedProductCategory } from '@/api/product-categories';

// What headless-tree knows about a row. Item ids are the category id as a
// string; `rootItemId` is the invisible root holding the top-level categories.
export type TreeItemData = {
  name: string;
  children?: string[];
  nodeId?: number;
};
export type TreeItems = Record<string, TreeItemData>;

export const rootItemId = 'root';

// Keeps categories whose title matches, with their whole subtree, plus the
// ancestors leading to them.
export function filterCategories(
  nodes: NestedProductCategory[],
  query: string
): NestedProductCategory[] {
  return nodes.flatMap((node) => {
    if (node.title.toLowerCase().includes(query)) return [node];
    const children = filterCategories(node.children, query);
    return children.length > 0 ? [{ ...node, children }] : [];
  });
}

export function buildTreeItems(categories: NestedProductCategory[]): TreeItems {
  const items: TreeItems = {
    [rootItemId]: {
      name: rootItemId,
      children: categories.map((category) => String(category.id))
    }
  };
  const addNode = (node: NestedProductCategory) => {
    items[String(node.id)] = {
      name: node.title,
      children: node.children.length
        ? node.children.map((child) => String(child.id))
        : undefined,
      nodeId: node.id
    };
    node.children.forEach(addNode);
  };
  categories.forEach(addNode);
  return items;
}

// Item id → parent item id.
export function buildParentMap(items: TreeItems): Map<string, string> {
  const parentOf = new Map<string, string>();
  for (const [id, item] of Object.entries(items)) {
    item.children?.forEach((childId) => parentOf.set(childId, id));
  }
  return parentOf;
}
