import { buildApiUrl, buildResourceUrl, getEndpointUrl } from '@/config/api';
import type { Product } from '@/routes/_dashboard-layout/(user-view)/products/-components/product-tree-editor';

async function fetchProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const response = await fetch(buildApiUrl(getEndpointUrl('products')));
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

async function fetchProductById(id: number): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const response = await fetch(buildResourceUrl('products', id));
  if (response.status === 404) {
    throw new Error('Product not found');
  }
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

async function createProduct(payload: Omit<Product, 'id'>): Promise<Product> {
  const response = await fetch(getEndpointUrl('products'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('Failed to create product');
  }
  return response.json();
}

async function updateProduct(
  id: number,
  payload: Partial<Omit<Product, 'id'>>
): Promise<Product> {
  const response = await fetch(buildResourceUrl('products', id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('Failed to update product');
  }
  return response.json();
}

async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(buildResourceUrl('products', id), {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete product');
  }
}

export {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
