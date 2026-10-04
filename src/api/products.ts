import {
  type CreateProductData,
  createProductSchema,
  fetchProductsResponseSchema,
  type Product,
  productSchema,
  type UpdateProductData,
  updateProductSchema
} from 'shared/types/products';

import { client, handleApiError } from './client';

async function fetchProductsByCategory(categoryId: number): Promise<Product[]> {
  try {
    const response = await client.get('/products', {
      params: { category_id: categoryId }
    });
    return fetchProductsResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchProductsByCategory');
  }
}

async function createProduct(data: CreateProductData): Promise<Product> {
  try {
    const validated = createProductSchema.parse(data);
    const response = await client.post('/products', validated);
    return productSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'createProduct');
  }
}

async function updateProduct(
  id: number,
  data: UpdateProductData
): Promise<Product> {
  try {
    const validated = updateProductSchema.parse(data);
    const response = await client.patch(`/products/${id}`, validated);
    return productSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'updateProduct');
  }
}

async function deleteProduct(id: number): Promise<void> {
  try {
    await client.delete(`/products/${id}`);
  } catch (err) {
    handleApiError(err, 'deleteProduct');
  }
}

export type { Product };
export { createProduct, deleteProduct, fetchProductsByCategory, updateProduct };
