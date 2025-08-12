 
import { client } from '@/api/client';

type Product = { id: number; title: string; category_id: number };

async function fetchProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const { data } = await client.get<any[]>('/products');

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
  const { data } = await client.get<any[]>('/products', {
    params: { category_id: categoryId }
  });

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
  const { data } = await client.get<any>(`/products/${id}`);

  // Ensure id and category_id are numbers since JSON server returns them as strings
  return {
    ...data,
    id: Number(data.id),
    category_id: Number(data.category_id)
  };
}

async function createProduct(payload: Omit<Product, 'id'>): Promise<Product> {
  const { data } = await client.post<any>('/products', payload);

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
  const { data } = await client.patch<any>(`/products/${id}`, payload);

  // Ensure id and category_id are numbers since JSON server returns them as strings
  return {
    ...data,
    id: Number(data.id),
    category_id: Number(data.category_id)
  };
}

async function deleteProduct(id: number): Promise<void> {
  await client.delete(`/products/${id}`);
}

export {
  fetchProducts,
  fetchProductsByCategory,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
