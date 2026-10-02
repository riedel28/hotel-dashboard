import {
  type CreateProductCategoryData,
  createProductCategorySchema,
  fetchProductCategoriesResponseSchema,
  type ProductCategory,
  productCategorySchema,
  type UpdateProductCategoryData,
  updateProductCategorySchema
} from 'shared/types/products';

import { client, handleApiError } from './client';

export type { ProductCategory };

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
  try {
    const response = await client.get('/product-categories');
    return fetchProductCategoriesResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchProductCategories');
  }
}

async function fetchProductCategoryById(id: number): Promise<ProductCategory> {
  try {
    const response = await client.get(`/product-categories/${id}`);
    return productCategorySchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchProductCategoryById');
  }
}

async function createProductCategory(
  data: CreateProductCategoryData
): Promise<ProductCategory> {
  try {
    const validated = createProductCategorySchema.parse(data);
    const response = await client.post('/product-categories', validated);
    return productCategorySchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'createProductCategory');
  }
}

async function updateProductCategory(
  id: number,
  data: UpdateProductCategoryData
): Promise<ProductCategory> {
  try {
    const validated = updateProductCategorySchema.parse(data);
    const response = await client.patch(`/product-categories/${id}`, validated);
    return productCategorySchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'updateProductCategory');
  }
}

async function deleteProductCategory(id: number): Promise<void> {
  try {
    await client.delete(`/product-categories/${id}`);
  } catch (err) {
    handleApiError(err, 'deleteProductCategory');
  }
}

export {
  createProductCategory,
  deleteProductCategory,
  fetchProductCategories,
  fetchProductCategoryById,
  updateProductCategory
};
