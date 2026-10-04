import { useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createProductCategory,
  deleteProductCategory,
  productCategoriesQueryKey,
  type ProductCategory,
  updateProductCategory
} from '@/api/product-categories';

// Create, update (rename or move) and delete for product categories, each
// with its toasts and cache refresh.
export function useCategoryMutations() {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const queryKey = productCategoriesQueryKey;
  const refetchCategories = () => queryClient.invalidateQueries({ queryKey });

  const createCategory = useMutation({
    mutationFn: createProductCategory,
    onSuccess: (category) => {
      refetchCategories();
      toast.success(t`Category “${category.title}” added`);
    },
    onError: (error) => {
      toast.error(t`Failed to create category`, {
        description: error.message
      });
    }
  });

  const updateCategory = useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & Partial<Omit<ProductCategory, 'id'>>) =>
      updateProductCategory(id, data),
    // A rename is applied optimistically: the row shows the new title at
    // once and falls back to the old one if the server rejects it. Moves wait
    // for the server.
    onMutate: async ({ id, title }) => {
      if (title === undefined) return;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ProductCategory[]>(queryKey);
      queryClient.setQueryData<ProductCategory[]>(queryKey, (categories) =>
        categories?.map((item) => (item.id === id ? { ...item, title } : item))
      );
      return { previous };
    },
    onSuccess: (category, variables) => {
      toast.success(
        'parent_id' in variables
          ? t`Category “${category.title}” moved`
          : t`Category “${category.title}” updated`
      );
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(t`Failed to update category`, {
        description: error.message
      });
    },
    onSettled: refetchCategories
  });

  const deleteCategory = useMutation({
    mutationFn: ({ id }: { id: number; title: string }) =>
      deleteProductCategory(id),
    onSuccess: (_, category) => {
      refetchCategories();
      toast.success(t`Category “${category.title}” deleted`);
    },
    onError: (error) => {
      toast.error(t`Failed to delete category`, {
        description: error.message
      });
    }
  });

  return { createCategory, updateCategory, deleteCategory };
}
