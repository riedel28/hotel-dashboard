import { buildApiUrl, buildResourceUrl, getEndpointUrl } from '@/config/api';
import type { ProductCategory } from '@/routes/_dashboard-layout/(user-view)/products/-components/product-tree-editor';

export type FlatProductCategory = {
  id: number;
  title: string;
  parent_id: number | null;
};

export function transformFlatCategoriesToTree(
  flat: FlatProductCategory[]
): ProductCategory[] {
  const map = new Map<number, ProductCategory>();
  const roots: ProductCategory[] = [];
  flat.forEach((c) => {
    map.set(c.id, {
      id: c.id,
      title: c.title,
      parent_id: c.parent_id,
      children: []
    });
  });
  map.forEach((node) => {
    if (node.parent_id == null) {
      roots.push(node);
    } else {
      const parent = map.get(node.parent_id);
      if (parent) parent.children.push(node);
    }
  });
  return roots;
}
async function fetchProductCategories(): Promise<FlatProductCategory[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const response = await fetch(
    buildApiUrl(getEndpointUrl('productCategories'))
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}

async function fetchProductCategoryById(
  id: number
): Promise<FlatProductCategory> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const response = await fetch(buildResourceUrl('productCategories', id));
  if (response.status === 404) {
    throw new Error('Category not found');
  }
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

async function createProductCategory(
  payload: Omit<FlatProductCategory, 'id'>
): Promise<FlatProductCategory> {
  const response = await fetch(getEndpointUrl('productCategories'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('Failed to create category');
  }
  return response.json();
}

async function updateProductCategory(
  id: number,
  payload: Partial<Omit<FlatProductCategory, 'id'>>
): Promise<FlatProductCategory> {
  const response = await fetch(buildResourceUrl('productCategories', id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('Failed to update category');
  }
  return response.json();
}

async function deleteProductCategory(id: number): Promise<void> {
  const response = await fetch(buildResourceUrl('productCategories', id), {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete category');
  }
}

export {
  fetchProductCategories,
  fetchProductCategoryById,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory
};
