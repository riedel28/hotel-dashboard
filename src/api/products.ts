import { client } from '@/api/client';

type Product = { id: number; title: string; category_id: number };

type ProductRaw = {
  id: string | number;
  title: string;
  category_id: string | number;
};

async function fetchProducts(): Promise<Product[]> {
  const { data } = await client.get<ProductRaw[]>('/products');

  // Ensure id and category_id are numbers since JSON server returns them as strings
  return data.map((product) => ({
    ...product,
    id: Number(product.id),
    category_id: Number(product.category_id)
  }));
}

async function fetchProductsByCategory(categoryId: number): Promise<Product[]> {
  const { data } = await client.get<ProductRaw[]>('/products', {
    params: { category_id: categoryId }
  });

  // Ensure id and category_id are numbers since JSON server returns them as strings
  return data.map((product) => ({
    ...product,
    id: Number(product.id),
    category_id: Number(product.category_id)
  }));
}

async function fetchProductById(id: number): Promise<Product> {
  const { data } = await client.get<ProductRaw>(`/products/${id}`);

  // Ensure id and category_id are numbers since JSON server returns them as strings
  return {
    ...data,
    id: Number(data.id),
    category_id: Number(data.category_id)
  };
}

async function createProduct(payload: Omit<Product, 'id'>): Promise<Product> {
  const { data } = await client.post<ProductRaw>('/products', payload);

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
  const { data } = await client.patch<ProductRaw>(`/products/${id}`, payload);

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
