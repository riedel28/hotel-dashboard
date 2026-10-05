import type { ProductCategory } from '@/api/product-categories';

// What headless-tree knows about a row. Item ids are the category id as a
// string; `rootItemId` is the invisible root holding the top-level categories.
export type TreeItemData = { name: string; children?: string[] };
export type TreeItems = Record<string, TreeItemData>;

export const rootItemId = 'root';

// The tree item id of a category's parent.
export function parentItemId(category: ProductCategory) {
  return category.parent_id == null ? rootItemId : String(category.parent_id);
}

// Builds the tree's items straight from the flat list; siblings keep the
// list's order.
export function buildTreeItems(categories: ProductCategory[]): TreeItems {
  const items: TreeItems = { [rootItemId]: { name: rootItemId, children: [] } };
  for (const category of categories) {
    items[String(category.id)] = { name: category.title };
  }
  for (const category of categories) {
    const parent = items[parentItemId(category)];
    if (parent) {
      (parent.children ??= []).push(String(category.id));
    }
  }
  return items;
}

type CategoriesById = Map<number, ProductCategory>;

function indexById(categories: ProductCategory[]): CategoriesById {
  return new Map(categories.map((category) => [category.id, category]));
}

function lineageOf(byId: CategoriesById, categoryId: number) {
  const lineage: ProductCategory[] = [];
  let category = byId.get(categoryId);
  while (category) {
    lineage.push(category);
    category =
      category.parent_id == null ? undefined : byId.get(category.parent_id);
  }
  return lineage;
}

// A category followed by its ancestors, nearest first. Empty if the id is
// unknown.
export function categoryLineage(
  categories: ProductCategory[],
  categoryId: number
) {
  return lineageOf(indexById(categories), categoryId);
}

// Keeps categories whose title matches (`query` is lower-cased), with their
// whole subtree, plus the ancestors leading to them.
export function filterCategories(categories: ProductCategory[], query: string) {
  const byId = indexById(categories);
  const kept = new Set<number>();
  // Each category's lineage is walked upwards, which covers both directions:
  // a match keeps its ancestors, and a category below a match is kept
  // because that match is in its lineage.
  for (const category of categories) {
    const lineage = lineageOf(byId, category.id);
    const nearestMatch = lineage.findIndex((ancestor) =>
      ancestor.title.toLowerCase().includes(query)
    );
    if (nearestMatch === -1) continue;
    kept.add(category.id);
    if (nearestMatch === 0) {
      lineage.forEach((ancestor) => kept.add(ancestor.id));
    }
  }
  return categories.filter((category) => kept.has(category.id));
}
