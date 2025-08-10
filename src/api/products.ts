import { buildApiUrl, buildResourceUrl, getEndpointUrl } from '@/config/api';

type Product = { id: number; title: string; category_id: number };

async function fetchProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const response = await fetch(buildApiUrl(getEndpointUrl('products')));
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();

  // Ensure id and category_id are numbers since JSON server returns them as strings
  return data.map(
    (product: {
      id: string | number;
      title: string;
      category_id: string | number;
    }) => ({
      ...product,
      id: Number(product.id),
      category_id: Number(product.category_id)
    })
  );
}

async function fetchProductsByCategory(categoryId: number): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const response = await fetch(
    buildApiUrl(getEndpointUrl('products'), { category_id: categoryId })
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();

  // Ensure id and category_id are numbers since JSON server returns them as strings
  return data.map(
    (product: {
      id: string | number;
      title: string;
      category_id: string | number;
    }) => ({
      ...product,
      id: Number(product.id),
      category_id: Number(product.category_id)
    })
  );
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
  const data = await response.json();

  // Ensure id and category_id are numbers since JSON server returns them as strings
  return {
    ...data,
    id: Number(data.id),
    category_id: Number(data.category_id)
  };
}

async function createProduct(payload: Omit<Product, 'id'>): Promise<Product> {
  const response = await fetch(buildApiUrl(getEndpointUrl('products')), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('Failed to create product');
  }
  const data = await response.json();

  // Ensure id and category_id are numbers since JSON server returns them as strings
  return {
    ...data,
    id: Number(data.id),
    category_id: Number(data.category_id)
  };
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
  const data = await response.json();

  // Ensure id and category_id are numbers since JSON server returns them as strings
  return {
    ...data,
    id: Number(data.id),
    category_id: Number(data.category_id)
  };
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
  fetchProductsByCategory,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
