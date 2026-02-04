import type { ItemInstance } from '@headless-tree/core';
import { hotkeysCoreFeature, syncDataLoaderFeature } from '@headless-tree/core';
import { useTree } from '@headless-tree/react';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { XIcon } from 'lucide-react';
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ErrorDisplay,
  ErrorDisplayActions,
  ErrorDisplayIcon,
  ErrorDisplayMessage,
  ErrorDisplayRetryButton,
  ErrorDisplayTitle
} from '@/components/ui/error-display';
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

  const createCategoryMutation = useMutation({
    mutationFn: createProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast.success('Category created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create category', {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update category', {
        description: error.message
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete category', {
        description: error.message
      });
    }
  });

  const indent = 12;

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

  const treeKey = React.useMemo(() => {
    const ids: number[] = [];
    if (categoriesQuery.data) {
      const visit = (nodes: NestedProductCategory[]) => {
        for (const n of nodes) {
          ids.push(n.id);
          if (n.children && n.children.length) visit(n.children);
        }
      };
      visit(categoriesQuery.data);
    }
    return ids.sort((a, b) => a - b).join('-');
  }, [categoriesQuery.data]);

  const [expandedItems, setExpandedItems] = React.useState<string[]>(['root']);

  const handleToggleFolder = React.useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const has = prev.includes(itemId);
      const next = has ? prev.filter((id) => id !== itemId) : [...prev, itemId];
      return next.includes('root') ? next : ['root', ...next];
    });
  }, []);

  function CategoriesTreeInner({
    itemsMap,
    selectedCategoryId
  }: {
    itemsMap: Record<string, TreeItemData>;
    selectedCategoryId: number | null;
  }) {
    const tree = useTree<TreeItemData>({
      initialState: { expandedItems },
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

    return (
      <Tree key={treeKey} indent={indent} tree={tree} className="space-y-1">
        {tree.getItems().map((item: ItemInstance<TreeItemData>) => {
          const id = item.getId() as string;
          const data = item.getItemData();
          const numericId =
            typeof data?.nodeId === 'number' ? data.nodeId : null;
          const isSelected =
            numericId != null && selectedCategoryId === numericId;

          return (
            <TreeItem key={id} item={item}>
              <TreeItemLabel
                aria-selected={isSelected}
                className={cn(
                  'group w-full justify-between rounded-sm px-2 py-1 text-sm font-medium',
                  isSelected
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent'
                )}
                onClick={() => {
                  // Toggle expand/collapse for folders. Do not navigate on folders.
                  if (typeof item.isFolder === 'function' && item.isFolder()) {
                    const expandable = item as ItemInstance<TreeItemData> & {
                      toggleExpanded?: () => void;
                      setExpanded?: (expanded: boolean) => void;
                      isExpanded?: () => boolean;
                    };
                    if (expandable.toggleExpanded) {
                      expandable.toggleExpanded();
                    } else if (
                      expandable.setExpanded &&
                      expandable.isExpanded
                    ) {
                      expandable.setExpanded(!expandable.isExpanded());
                    }
                    handleToggleFolder(id);
                    return;
                  }
                  // Leaf: navigate/select
                  if (numericId != null) {
                    handleCategorySelect(numericId);
                  }
                }}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span>{data?.name}</span>

                  {numericId != null ? (
                    <CategoryActionsDropdown
                      categoryId={numericId}
                      categoryTitle={data?.name ?? ''}
                      onAddSubcategory={openAddSubcategoryModal}
                      onEditCategory={openEditCategoryModal}
                      onDeleteCategory={openDeleteCategoryModal}
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
        await deleteCategoryMutation.mutateAsync(
          pendingDeleteCategory.categoryId
        );
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
          <div className="space-y-2 pl-4">
            <Skeleton className="h-7 w-1/2 rounded-md" />
            <Skeleton className="h-7 w-1/3 rounded-md" />
            <Skeleton className="h-7 w-1/2 rounded-md" />
            <Skeleton className="h-7 w-1/3 rounded-md" />
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
          <ErrorDisplay variant="destructive" size="sm" className="w-full">
            <ErrorDisplayIcon icon={XIcon} />
            <ErrorDisplayTitle>
              <Trans>Failed to load categories</Trans>
            </ErrorDisplayTitle>
            <ErrorDisplayMessage>
              <Trans>
                There was an error loading the product categories. Please try
                again.
              </Trans>
            </ErrorDisplayMessage>
            <ErrorDisplayActions>
              <ErrorDisplayRetryButton
                onRetry={() => categoriesQuery.refetch()}
                isRetrying={categoriesQuery.isRefetching}
              />
            </ErrorDisplayActions>
          </ErrorDisplay>
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
            <CategoriesTreeInner
              key={treeKey}
              itemsMap={itemsMap}
              selectedCategoryId={selectedCategoryId}
            />
          )}
        </CardContent>
      </Card>
      <AddCategoryModal
        open={pendingAddSubcategoryForId != null}
        onOpenChange={(open) => !open && closeAddSubcategoryModal()}
        onSave={handleAddSubcategory}
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
