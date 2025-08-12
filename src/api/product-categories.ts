 
import { client } from '@/api/client';

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

  const { data } = await client.get<any[]>('/product-categories');

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
  const { data } = await client.get<any>(`/product-categories/${id}`);

  // Ensure id is a number since JSON server returns it as a string
  return {
    ...data,
    id: Number(data.id)
  };
}

async function createProductCategory(
  payload: Omit<ProductCategory, 'id'>
): Promise<ProductCategory> {
  const { data } = await client.post<any>('/product-categories', payload);
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
  const { data } = await client.patch<any>(
    `/product-categories/${id}`,
    payload
  );
  // Ensure id is a number since JSON server returns it as a string
  return {
    ...data,
    id: Number(data.id)
  };
}

async function deleteProductCategory(id: number): Promise<void> {
  await client.delete(`/product-categories/${id}`);
}

export {
  fetchProductCategories,
  fetchProductCategoryById,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory
};
