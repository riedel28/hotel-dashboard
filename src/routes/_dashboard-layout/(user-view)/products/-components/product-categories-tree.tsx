import type { ItemInstance } from '@headless-tree/core';
import { hotkeysCoreFeature, syncDataLoaderFeature } from '@headless-tree/core';
import { useTree } from '@headless-tree/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { RefreshCwIcon, XIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import {
  createProductCategory,
  deleteProductCategory,
  fetchProductCategories,
  type NestedProductCategory,
  type ProductCategory,
  transformFlatCategoriesToTree,
  updateProductCategory
} from '@/api/product-categories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Tree, TreeItem, TreeItemLabel } from '@/components/ui/tree';
import { cn } from '@/lib/utils';

import { Route as ProductsRoute } from '../index';
import { AddCategoryModal } from './add-category-modal';
import { CategoriesEmptyState } from './categories-empty-state';
import { CategoryActionsDropdown } from './category-actions-dropdown';
import { DeleteCategoryDialog } from './delete-category-dialog';
import { EditCategoryModal } from './edit-category-modal';
import { useCategoryModals } from './use-category-modals';

type TreeItemData = { name: string; children?: string[]; nodeId?: number };

// 20px puts each indent guide under the centre of its parent's chevron.
const indent = 20;

interface CategoriesTreeProps {
  itemsMap: Record<string, TreeItemData>;
  categories: NestedProductCategory[];
  selectedCategoryId: number | null;
  expandedItems: string[];
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
  onSelect: (categoryId: number) => void;
  onAddSubcategory: (categoryId: number) => void;
  onEditCategory: (categoryId: number, initialTitle: string) => void;
  onDeleteCategory: (categoryId: number, title: string) => void;
  onMoveCategory: (categoryId: number, newParentId: number | null) => void;
}

// Declared at module level so it keeps its identity (and the tree its DOM)
// across parent renders; expansion state is owned by the parent.
function CategoriesTree({
  itemsMap,
  categories,
  selectedCategoryId,
  expandedItems,
  setExpandedItems,
  onSelect,
  onAddSubcategory,
  onEditCategory,
  onDeleteCategory,
  onMoveCategory
}: CategoriesTreeProps) {
  const tree = useTree<TreeItemData>({
    state: { expandedItems },
    setExpandedItems,
    indent,
    rootItemId: 'root',
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) =>
        itemsMap[itemId] ?? { name: 'unknown', children: [] },
      getChildren: (itemId) => itemsMap[itemId]?.children ?? []
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature]
  });

  // Pick up added, removed or renamed categories without remounting.
  React.useEffect(() => {
    tree.rebuildTree();
  }, [tree, itemsMap]);

  return (
    <Tree indent={indent} tree={tree}>
      {tree.getItems().map((item: ItemInstance<TreeItemData>) => {
        const id = item.getId();
        const data = item.getItemData();
        const numericId = typeof data?.nodeId === 'number' ? data.nodeId : null;
        const isSelected =
          numericId != null && selectedCategoryId === numericId;

        return (
          <TreeItem
            key={id}
            item={item}
            // Indent guides: one vertical line per ancestor level, drawn only
            // across this item's indentation. pb-1 (instead of a gap between
            // items) keeps the lines continuous. Rows mounted by expanding a
            // folder fade/slide in.
            className="relative pb-1 duration-150 ease-out before:absolute before:inset-y-0 before:start-0 before:w-(--tree-padding) before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_15px,var(--border)_15px,var(--border)_16px,transparent_16px,transparent_var(--tree-indent))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1"
          >
            <TreeItemLabel
              aria-selected={isSelected}
              className={cn(
                'group w-full justify-between rounded-lg bg-card px-2 py-1 text-sm font-medium',
                isSelected
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent'
              )}
              onClick={() => {
                // Folders are toggled by headless-tree's own item click
                // handler (the click bubbles to the TreeItem); leaves select.
                if (!item.isFolder() && numericId != null) {
                  onSelect(numericId);
                }
              }}
            >
              <div className="flex w-full min-w-0 items-center justify-between gap-1">
                <span className="truncate" title={data?.name}>
                  {data?.name}
                </span>

                {numericId != null ? (
                  <CategoryActionsDropdown
                    categoryId={numericId}
                    categoryTitle={data?.name ?? ''}
                    parentId={item.getParent()?.getItemData()?.nodeId ?? null}
                    categories={categories}
                    onAddSubcategory={onAddSubcategory}
                    onEditCategory={onEditCategory}
                    onDeleteCategory={onDeleteCategory}
                    onMoveCategory={onMoveCategory}
                  />
                ) : null}
              </div>
            </TreeItemLabel>
          </TreeItem>
        );
      })}
    </Tree>
  );
}

export function ProductCategoriesTree() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const selectedCategoryId = ProductsRoute.useSearch().category_id ?? null;

  const categoriesQuery = useQuery<
    ProductCategory[],
    Error,
    NestedProductCategory[]
  >({
    queryKey: ['product-categories'],
    queryFn: fetchProductCategories,
    select: transformFlatCategoriesToTree
  });

  const { t } = useLingui();

  const createCategoryMutation = useMutation({
    mutationFn: createProductCategory,
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast.success(t`Category “${category.title}” added`);
    },
    onError: (error) => {
      toast.error(t`Failed to create category`, {
        description: error.message
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & Partial<Omit<ProductCategory, 'id'>>) =>
      updateProductCategory(id, data),
    onSuccess: (category, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast.success(
        'parent_id' in variables
          ? t`Category “${category.title}” moved`
          : t`Category “${category.title}” updated`
      );
    },
    onError: (error) => {
      toast.error(t`Failed to update category`, {
        description: error.message
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: ({ id }: { id: number; title: string }) =>
      deleteProductCategory(id),
    onSuccess: (_, category) => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast.success(t`Category “${category.title}” deleted`);
    },
    onError: (error) => {
      toast.error(t`Failed to delete category`, {
        description: error.message
      });
    }
  });

  const { itemsMap } = React.useMemo(() => {
    const map: Record<string, TreeItemData> = {};
    const topLevelIds: string[] = [];

    if (categoriesQuery.data) {
      const addNode = (node: NestedProductCategory) => {
        const idStr = String(node.id);
        const childrenIds = (node.children ?? []).map((c) => String(c.id));
        map[idStr] = {
          name: node.title,
          children: childrenIds.length ? childrenIds : undefined,
          nodeId: node.id
        };
        node.children?.forEach(addNode);
      };

      categoriesQuery.data.forEach((cat) => {
        topLevelIds.push(String(cat.id));
        addNode(cat);
      });
    }

    map.root = { name: 'root', children: topLevelIds };
    return { itemsMap: map };
  }, [categoriesQuery.data]);

  const [expandedItems, setExpandedItems] = React.useState<string[]>(['root']);

  // Expand the ancestors of the category selected in the URL, so it's visible
  // after a reload or back/forward navigation.
  React.useEffect(() => {
    if (selectedCategoryId == null) return;
    const parentOf = new Map<string, string>();
    for (const [id, node] of Object.entries(itemsMap)) {
      node.children?.forEach((childId) => parentOf.set(childId, id));
    }
    const ancestors: string[] = [];
    let current = parentOf.get(String(selectedCategoryId));
    while (current && current !== 'root') {
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

  const {
    pendingAddSubcategoryForId,
    pendingAddRootCategory,
    pendingEditCategory,
    pendingDeleteCategory,
    openAddSubcategoryModal,
    closeAddSubcategoryModal,
    openAddRootCategoryModal,
    closeAddRootCategoryModal,
    openEditCategoryModal,
    closeEditCategoryModal,
    openDeleteCategoryModal,
    closeDeleteCategoryModal
  } = useCategoryModals();

  const handleCategorySelect = (categoryId: number) => {
    navigate({
      to: '/products',
      search: { category_id: categoryId }
    });
  };

  const handleMoveCategory = (
    categoryId: number,
    newParentId: number | null
  ) => {
    updateCategoryMutation.mutate(
      { id: categoryId, parent_id: newParentId },
      {
        // Reveal the category in its new place.
        onSuccess: () => {
          if (newParentId == null) return;
          const parentKey = String(newParentId);
          setExpandedItems((prev) =>
            prev.includes(parentKey) ? prev : [...prev, parentKey]
          );
        }
      }
    );
  };

  const handleCategoryDeselect = () => {
    navigate({
      to: '/products',
      search: {}
    });
  };

  const handleAddSubcategory = async (newTitle: string) => {
    if (pendingAddSubcategoryForId != null) {
      try {
        await createCategoryMutation.mutateAsync({
          title: newTitle.trim(),
          parent_id: pendingAddSubcategoryForId
        });
        closeAddSubcategoryModal();
      } catch {
        // Error is already handled by the mutation's onError
        // Keep modal open so user can retry
      }
    }
  };

  const handleAddRootCategory = async (newTitle: string) => {
    try {
      await createCategoryMutation.mutateAsync({
        title: newTitle.trim(),
        parent_id: null
      });
      closeAddRootCategoryModal();
    } catch {
      // Error is already handled by the mutation's onError
      // Keep modal open so user can retry
    }
  };

  const handleEditCategory = async (newTitle: string) => {
    if (pendingEditCategory) {
      try {
        await updateCategoryMutation.mutateAsync({
          id: pendingEditCategory.categoryId,
          title: newTitle.trim()
        });
        closeEditCategoryModal();
      } catch {
        // Error is already handled by the mutation's onError
        // Keep modal open so user can retry
      }
    }
  };

  const handleDeleteCategory = async () => {
    if (pendingDeleteCategory) {
      try {
        await deleteCategoryMutation.mutateAsync({
          id: pendingDeleteCategory.categoryId,
          title: pendingDeleteCategory.title
        });
        if (selectedCategoryId === pendingDeleteCategory.categoryId) {
          handleCategoryDeselect();
        }
        closeDeleteCategoryModal();
      } catch {
        // Error is already handled by the mutation's onError
        // Keep dialog open so user can retry
      }
    }
  };

  if (categoriesQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Trans>Product categories</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Matches real rows: 40px label + 4px gap, 20px per indent level. */}
          <div className="flex flex-col gap-1">
            <Skeleton className="h-10 w-1/2 rounded-lg" />
            <Skeleton className="ms-5 h-10 w-2/5 rounded-lg" />
            <Skeleton className="ms-5 h-10 w-1/3 rounded-lg" />
            <Skeleton className="h-10 w-2/5 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  //

  if (categoriesQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Trans>Product categories</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Empty variant="destructive" className="w-full md:p-6">
            <EmptyHeader>
              <EmptyMedia variant="destructive">
                <XIcon />
              </EmptyMedia>
              <EmptyTitle>
                <Trans>Failed to load categories</Trans>
              </EmptyTitle>
              <EmptyDescription>
                <Trans>
                  There was an error loading the product categories. Please try
                  again.
                </Trans>
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="destructive"
                onClick={() => categoriesQuery.refetch()}
                disabled={categoriesQuery.isRefetching}
              >
                <RefreshCwIcon
                  className={cn(
                    'mr-2 h-4 w-4',
                    categoriesQuery.isRefetching && 'animate-spin'
                  )}
                />
                <Trans>Try again</Trans>
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Trans>Product categories</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {!categoriesQuery.data || categoriesQuery.data.length === 0 ? (
            <CategoriesEmptyState onAddCategory={openAddRootCategoryModal} />
          ) : (
            <CategoriesTree
              itemsMap={itemsMap}
              categories={categoriesQuery.data}
              selectedCategoryId={selectedCategoryId}
              expandedItems={expandedItems}
              setExpandedItems={setExpandedItems}
              onSelect={handleCategorySelect}
              onAddSubcategory={openAddSubcategoryModal}
              onEditCategory={openEditCategoryModal}
              onDeleteCategory={openDeleteCategoryModal}
              onMoveCategory={handleMoveCategory}
            />
          )}
        </CardContent>
      </Card>
      <AddCategoryModal
        open={pendingAddSubcategoryForId != null}
        onOpenChange={(open) => !open && closeAddSubcategoryModal()}
        onSave={handleAddSubcategory}
        isSubcategory
      />
      <AddCategoryModal
        open={pendingAddRootCategory}
        onOpenChange={(open) => !open && closeAddRootCategoryModal()}
        onSave={handleAddRootCategory}
      />
      <EditCategoryModal
        open={pendingEditCategory != null}
        initialTitle={pendingEditCategory?.initialTitle ?? ''}
        onOpenChange={(open) => !open && closeEditCategoryModal()}
        onSave={handleEditCategory}
      />
      <DeleteCategoryDialog
        open={pendingDeleteCategory != null}
        categoryTitle={pendingDeleteCategory?.title ?? ''}
        onOpenChange={(open) => !open && closeDeleteCategoryModal()}
        onConfirm={handleDeleteCategory}
      />
    </>
  );
}
