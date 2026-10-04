import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import * as React from 'react';

import {
  fetchProductCategories,
  type NestedProductCategory,
  productCategoriesQueryKey,
  type ProductCategory,
  transformFlatCategoriesToTree
} from '@/api/product-categories';
import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { SearchInput } from '@/components/ui/search-input';
import { Skeleton } from '@/components/ui/skeleton';

import { Route as ProductsRoute } from '../index';
import { AddCategoryModal } from './add-category-modal';
import { CategoriesEmptyState } from './categories-empty-state';
import { CategoriesTree } from './categories-tree';
import {
  buildParentMap,
  buildTreeItems,
  filterCategories,
  rootItemId
} from './category-tree-data';
import { DeleteCategoryDialog } from './delete-category-dialog';
import { useCategoryMutations } from './use-category-mutations';

function CategoriesCard({
  action,
  children
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          <Trans>Product categories</Trans>
        </CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

export function ProductCategoriesTree() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const selectedCategoryId = ProductsRoute.useSearch().category_id ?? null;

  const categoriesQuery = useQuery<
    ProductCategory[],
    Error,
    NestedProductCategory[]
  >({
    queryKey: productCategoriesQueryKey,
    queryFn: fetchProductCategories,
    select: transformFlatCategoriesToTree
  });
  const { createCategory, updateCategory, deleteCategory } =
    useCategoryMutations();

  const [search, setSearch] = React.useState('');
  const query = search.trim().toLowerCase();

  const itemsMap = React.useMemo(() => {
    const categories = categoriesQuery.data ?? [];
    return buildTreeItems(
      query ? filterCategories(categories, query) : categories
    );
  }, [categoriesQuery.data, query]);

  const [expandedItems, setExpandedItems] = React.useState<string[]>([
    rootItemId
  ]);

  // Expand the ancestors of the category selected in the URL, so it's visible
  // after a reload or back/forward navigation.
  React.useEffect(() => {
    if (selectedCategoryId == null) return;
    const parentOf = buildParentMap(itemsMap);
    const ancestors: string[] = [];
    let current = parentOf.get(String(selectedCategoryId));
    while (current && current !== rootItemId) {
      ancestors.push(current);
      current = parentOf.get(current);
    }
    if (ancestors.length === 0) return;
    setExpandedItems((prev) =>
      ancestors.every((id) => prev.includes(id))
        ? prev
        : [...new Set([...prev, ...ancestors])]
    );
  }, [itemsMap, selectedCategoryId]);

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
    updateCategory.mutate(
      { id: categoryId, parent_id: newParentId },
      { onSuccess: () => expandParent(newParentId) }
    );
  };

  // On failure the mutation's onError shows a toast and the dialog stays open
  // for a retry.
  const handleAddCategory = (title: string) => {
    createCategory.mutate(
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
    deleteCategory.mutate(pendingDelete, {
      onSuccess: () => {
        if (selectedCategoryId === pendingDelete.id) {
          navigate({ to: '/products', search: {} });
        }
        setPendingDelete(null);
      }
    });
  };

  if (categoriesQuery.isLoading) {
    return (
      <CategoriesCard>
        {/* Matches real rows: 40px label + 4px gap, 20px per indent level. */}
        <div className="flex flex-col gap-1">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="ms-5 h-10 w-3/5 rounded-lg" />
          <Skeleton className="ms-5 h-10 w-2/5 rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </CategoriesCard>
    );
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
            {itemsMap[rootItemId]?.children?.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                <Trans>No categories found</Trans>
              </p>
            ) : (
              <CategoriesTree
                itemsMap={itemsMap}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                // While searching every match is shown expanded; the
                // user's own expansion state comes back when it's cleared.
                expandedItems={query ? Object.keys(itemsMap) : expandedItems}
                setExpandedItems={query ? () => {} : setExpandedItems}
                onSelect={(categoryId) =>
                  navigate({
                    to: '/products',
                    search: { category_id: categoryId }
                  })
                }
                onAddSubcategory={openAddCategory}
                onRenameCategory={(id, title) =>
                  updateCategory.mutate({ id, title })
                }
                onDeleteCategory={setPendingDelete}
                onMoveCategory={handleMoveCategory}
              />
            )}
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
