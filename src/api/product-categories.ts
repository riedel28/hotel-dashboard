import { queryOptions } from '@tanstack/react-query';
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

async function fetchProductCategories(): Promise<ProductCategory[]> {
  try {
    const response = await client.get('/product-categories');
    return fetchProductCategoriesResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchProductCategories');
  }
}

// The flat category list. Shared by the tree, the selection and the mutations,
// so they all read and patch one cache entry.
const productCategoriesQueryOptions = queryOptions({
  queryKey: ['product-categories'] as const,
  queryFn: fetchProductCategories
});

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
  productCategoriesQueryOptions,
  updateProductCategory
};
