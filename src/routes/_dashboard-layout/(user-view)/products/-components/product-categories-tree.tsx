import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import * as React from 'react';

import { productCategoriesQueryOptions } from '@/api/product-categories';
import { productsByCategoryQueryOptions } from '@/api/products';
import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';

import { AddCategoryModal } from './add-category-modal';
import { CategoriesCard } from './categories-card';
import { CategoriesEmptyState } from './categories-empty-state';
import { CategoriesLoadingState } from './categories-loading-state';
import { CategoriesTree } from './categories-tree';
import { categoryLineage, rootItemId } from './category-tree-data';
import { DeleteCategoryDialog } from './delete-category-dialog';
import { useCategoryMutations } from './use-category-mutations';
import { useSelectedCategory } from './use-selected-category';

export function ProductCategoriesTree() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { categoryId: selectedCategoryId } = useSelectedCategory();
  const categoriesQuery = useQuery(productCategoriesQueryOptions);
  const { create, update, remove } = useCategoryMutations();

  const [search, setSearch] = React.useState('');
  const query = search.trim().toLowerCase();

  const [expandedItems, setExpandedItems] = React.useState<string[]>([
    rootItemId
  ]);

  // Expand the ancestors of the category selected in the URL, so it's visible
  // after a reload or back/forward navigation.
  React.useEffect(() => {
    if (selectedCategoryId == null || !categoriesQuery.data) return;
    const ancestors = categoryLineage(categoriesQuery.data, selectedCategoryId)
      .slice(1)
      .map((category) => String(category.id));
    if (ancestors.length === 0) return;
    setExpandedItems((prev) =>
      ancestors.every((id) => prev.includes(id))
        ? prev
        : [...new Set([...prev, ...ancestors])]
    );
  }, [categoriesQuery.data, selectedCategoryId]);

  // `parentId: null` adds a top-level category. The target is kept while the
  // modal closes so its title doesn't change mid-animation.
  const [addCategory, setAddCategory] = React.useState<{
    open: boolean;
    parentId: number | null;
  }>({ open: false, parentId: null });
  const openAddCategory = (parentId: number | null) =>
    setAddCategory({ open: true, parentId });
  const closeAddCategory = () =>
    setAddCategory((prev) => ({ ...prev, open: false }));

  const [pendingDelete, setPendingDelete] = React.useState<{
    id: number;
    title: string;
  } | null>(null);

  // Reveals a category that was just added to or moved into `parentId`.
  const expandParent = (parentId: number | null) => {
    if (parentId == null) return;
    const parentKey = String(parentId);
    setExpandedItems((prev) =>
      prev.includes(parentKey) ? prev : [...prev, parentKey]
    );
  };

  const handleMoveCategory = (
    categoryId: number,
    newParentId: number | null
  ) => {
    update.mutate(
      { id: categoryId, parent_id: newParentId },
      { onSuccess: () => expandParent(newParentId) }
    );
  };

  // On failure the mutation's onError shows a toast and the dialog stays open
  // for a retry.
  const handleAddCategory = (title: string) => {
    create.mutate(
      { title, parent_id: addCategory.parentId },
      {
        onSuccess: () => {
          expandParent(addCategory.parentId);
          closeAddCategory();
        }
      }
    );
  };

  const handleDeleteCategory = () => {
    if (!pendingDelete) return;
    remove.mutate(pendingDelete, {
      onSuccess: () => {
        if (selectedCategoryId === pendingDelete.id) {
          navigate({ to: '/products', search: {} });
        }
        setPendingDelete(null);
      }
    });
  };

  if (categoriesQuery.isLoading) {
    return <CategoriesLoadingState />;
  }

  if (categoriesQuery.isError) {
    return (
      <CategoriesCard>
        <ErrorState
          size="sm"
          title={<Trans>Failed to load categories</Trans>}
          message={categoriesQuery.error?.message}
          onRetry={() => categoriesQuery.refetch()}
          isRetrying={categoriesQuery.isRefetching}
        />
      </CategoriesCard>
    );
  }

  const categories = categoriesQuery.data ?? [];
  const hasCategories = categories.length > 0;

  return (
    <>
      <CategoriesCard
        // The empty state has its own, labelled button.
        action={
          hasCategories && (
            <Button
              variant="secondary"
              size="icon-sm"
              className="bg-clip-border"
              aria-label={t`Add category`}
              title={t`Add category`}
              onClick={() => openAddCategory(null)}
            >
              <PlusIcon />
            </Button>
          )
        }
      >
        {!hasCategories ? (
          <CategoriesEmptyState onAddCategory={() => openAddCategory(null)} />
        ) : (
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t`Search categories`}
              aria-label={t`Search categories`}
              wrapperClassName="mb-3"
            />
            <CategoriesTree
              categories={categories}
              query={query}
              selectedCategoryId={selectedCategoryId}
              expandedItems={expandedItems}
              setExpandedItems={setExpandedItems}
              onSelect={(categoryId) =>
                navigate({
                  to: '/products',
                  search: { category_id: categoryId }
                })
              }
              // No-op while the cached products are still fresh.
              onPrefetch={(categoryId) =>
                queryClient.prefetchQuery(
                  productsByCategoryQueryOptions(categoryId)
                )
              }
              onAddSubcategory={openAddCategory}
              onRenameCategory={(id, title) => update.mutate({ id, title })}
              onDeleteCategory={setPendingDelete}
              onMoveCategory={handleMoveCategory}
            />
          </>
        )}
      </CategoriesCard>
      <AddCategoryModal
        open={addCategory.open}
        onOpenChange={(open) => !open && closeAddCategory()}
        onSave={handleAddCategory}
        isSubcategory={addCategory.parentId != null}
      />
      <DeleteCategoryDialog
        open={pendingDelete != null}
        categoryTitle={pendingDelete?.title ?? ''}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleDeleteCategory}
      />
    </>
  );
}
