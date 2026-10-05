import { useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createProduct,
  deleteProduct,
  type Product,
  productsByCategoryQueryOptions,
  updateProduct
} from '@/api/products';

import type { ProductFormValues } from './product-form-drawer';

// Create, update and remove for the products of one category, each with its
// toasts.
//
// Cache: nothing is optimistic. Once the server confirms, the cached list is
// patched so the table changes together with the dialog closing, then
// refetched to reconcile.
export function useProductMutations(categoryId: number) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const { queryKey } = productsByCategoryQueryOptions(categoryId);

  const updateCachedProducts = (update: (products: Product[]) => Product[]) => {
    queryClient.setQueryData(queryKey, (products) =>
      products
        ? update(products).sort((a, b) => a.title.localeCompare(b.title))
        : products
    );
    queryClient.invalidateQueries({ queryKey });
  };

  const create = useMutation({
    mutationFn: (values: ProductFormValues) =>
      createProduct({ ...values, category_id: categoryId }),
    onSuccess: (product) => {
      updateCachedProducts((products) => [...products, product]);
      toast.success(t`Product “${product.title}” added`);
    },
    onError: (error) => {
      toast.error(t`Failed to add product`, { description: error.message });
    }
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: number; values: ProductFormValues }) =>
      updateProduct(id, values),
    onSuccess: (product) => {
      updateCachedProducts((products) =>
        products.map((item) => (item.id === product.id ? product : item))
      );
      toast.success(t`Product “${product.title}” updated`);
    },
    onError: (error) => {
      toast.error(t`Failed to update product`, { description: error.message });
    }
  });

  const remove = useMutation({
    mutationFn: (product: Product) => deleteProduct(product.id),
    onSuccess: (_, product) => {
      updateCachedProducts((products) =>
        products.filter((item) => item.id !== product.id)
      );
      toast.success(t`Product “${product.title}” deleted`);
    },
    onError: (error) => {
      toast.error(t`Failed to delete product`, { description: error.message });
    }
  });

  return { create, update, remove };
}
