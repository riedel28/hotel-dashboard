import { buildApiUrl, buildResourceUrl, getEndpointUrl } from '@/config/api';

export type ProductCategory = {
  id: number;
  title: string;
  parent_id: number | null;
};

export type NestedProductCategory = ProductCategory & {
  children: NestedProductCategory[];
};

export function transformFlatCategoriesToTree(
  flat: ProductCategory[]
): NestedProductCategory[] {
  const map = new Map<number, NestedProductCategory>();
  const roots: NestedProductCategory[] = [];

  // Create all nodes first
  flat.forEach((c) => {
    map.set(c.id, {
      id: c.id,
      title: c.title,
      parent_id: c.parent_id,
      children: []
    });
  });

  // Build tree structure
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
async function fetchProductCategories(): Promise<ProductCategory[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const response = await fetch(
    buildApiUrl(getEndpointUrl('productCategories'))
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();

  // Ensure id and parent_id are numbers since JSON server returns them as strings
  return data.map(
    (category: {
      id: string | number;
      title: string;
      parent_id: string | number | null;
    }) => ({
      ...category,
      id: Number(category.id),
      parent_id: category.parent_id ? Number(category.parent_id) : null
    })
  );
}

async function fetchProductCategoryById(id: number): Promise<ProductCategory> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const response = await fetch(buildResourceUrl('productCategories', id));
  if (response.status === 404) {
    throw new Error('Category not found');
  }
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();

  // Ensure id is a number since JSON server returns it as a string
  return {
    ...data,
    id: Number(data.id)
  };
}

async function createProductCategory(
  payload: Omit<ProductCategory, 'id'>
): Promise<ProductCategory> {
  const response = await fetch(
    buildApiUrl(getEndpointUrl('productCategories')),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  if (!response.ok) {
    throw new Error('Failed to create category');
  }
  const data = await response.json();
  // Ensure id is a number since JSON server returns it as a string
  return {
    ...data,
    id: Number(data.id)
  };
}

async function updateProductCategory(
  id: number,
  payload: Partial<Omit<ProductCategory, 'id'>>
): Promise<ProductCategory> {
  const response = await fetch(buildResourceUrl('productCategories', id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('Failed to update category');
  }
  const data = await response.json();
  // Ensure id is a number since JSON server returns it as a string
  return {
    ...data,
    id: Number(data.id)
  };
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
