import type { ItemInstance } from '@headless-tree/core';
import {
  hotkeysCoreFeature,
  renamingFeature,
  syncDataLoaderFeature
} from '@headless-tree/core';
import { useTree } from '@headless-tree/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { CheckIcon, PlusIcon } from 'lucide-react';
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
import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tree, TreeItem, TreeItemLabel } from '@/components/ui/tree';
import { cn } from '@/lib/utils';

import { Route as ProductsRoute } from '../index';
import { AddCategoryModal } from './add-category-modal';
import { CategoriesEmptyState } from './categories-empty-state';
import { CategoryActionsDropdown } from './category-actions-dropdown';
import { DeleteCategoryDialog } from './delete-category-dialog';
import { useCategoryModals } from './use-category-modals';

type TreeItemData = { name: string; children?: string[]; nodeId?: number };

// Keeps categories whose title matches, with their whole subtree, plus the
// ancestors leading to them.
function filterCategories(
  nodes: NestedProductCategory[],
  query: string
): NestedProductCategory[] {
  return nodes.flatMap((node) => {
    if (node.title.toLowerCase().includes(query)) return [node];
    const children = filterCategories(node.children, query);
    return children.length > 0 ? [{ ...node, children }] : [];
  });
}

// 20px puts each indent guide under the centre of its parent's chevron.
const indent = 20;

// Indent guides: one vertical line per ancestor level, drawn only across the
// row's indentation. pb-1 (instead of a gap between rows) keeps the lines
// continuous.
const rowClassName =
  'relative pb-1 before:absolute before:inset-y-0 before:start-0 before:w-(--tree-padding) before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_15px,var(--border)_15px,var(--border)_16px,transparent_16px,transparent_var(--tree-indent))]';
// Rows mounted by expanding a folder fade/slide in.
const rowEnterClassName =
  'duration-150 ease-out motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1';

interface CategoriesTreeProps {
  itemsMap: Record<string, TreeItemData>;
  categories: NestedProductCategory[];
  selectedCategoryId: number | null;
  expandedItems: string[];
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
  onSelect: (categoryId: number) => void;
  onAddSubcategory: (categoryId: number) => void;
  onRenameCategory: (categoryId: number, title: string) => void;
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
  onRenameCategory,
  onDeleteCategory,
  onMoveCategory
}: CategoriesTreeProps) {
  const { t } = useLingui();
  const renamedItemRef = React.useRef<string | null>(null);
  // The Tab stop must be a row that is actually rendered. headless-tree keeps
  // pointing at the last focused item even after it is filtered out by the
  // search or hidden in a collapsed folder, which leaves the tree unreachable
  // by keyboard — so fall back to the selected category, then to the first row.
  const [focusedItem, setFocusedItem] = React.useState<string | null>(null);
  const isRendered = (itemId: string | null): itemId is string => {
    if (itemId == null || !itemsMap[itemId]) return false;
    const parentId = Object.keys(itemsMap).find((id) =>
      itemsMap[id]?.children?.includes(itemId)
    );
    return (
      parentId === 'root' ||
      (parentId != null &&
        expandedItems.includes(parentId) &&
        isRendered(parentId))
    );
  };
  const selectedItem =
    selectedCategoryId != null ? String(selectedCategoryId) : null;

  const tree = useTree<TreeItemData>({
    state: {
      expandedItems,
      focusedItem: isRendered(focusedItem)
        ? focusedItem
        : isRendered(selectedItem)
          ? selectedItem
          : null
    },
    setExpandedItems,
    setFocusedItem,
    // Fires on click and on Enter/Space. Folders are toggled by headless-tree
    // itself; leaves select.
    onPrimaryAction: (item) => {
      const nodeId = item.getItemData()?.nodeId;
      if (!item.isFolder() && nodeId != null) {
        onSelect(nodeId);
      }
    },
    indent,
    rootItemId: 'root',
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) =>
        itemsMap[itemId] ?? { name: 'unknown', children: [] },
      getChildren: (itemId) => itemsMap[itemId]?.children ?? []
    },
    // Inline rename: started from the row menu or with F2, Enter saves,
    // Escape or leaving the field cancels.
    onRename: (item, value) => {
      const nodeId = item.getItemData()?.nodeId;
      const title = value.trim();
      if (nodeId != null && title && title !== item.getItemName()) {
        onRenameCategory(nodeId, title);
      }
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, renamingFeature]
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

        if (item.isRenaming()) {
          renamedItemRef.current = id;
          return (
            // A div instead of the usual button: a text field can't live
            // inside a button.
            <TreeItem key={id} item={item} asChild className={rowClassName}>
              <div>
                <TreeItemLabel className="w-full rounded-lg bg-card px-2 py-1 hover:bg-card">
                  <Input
                    {...item.getRenameInputProps()}
                    aria-label={t`Category name`}
                    maxLength={200}
                    // Same height, text position and weight as the label it
                    // replaces. 5px = the field's border + padding, kept
                    // small so the field doesn't run into a folder's chevron.
                    className="-ms-[5px] h-8 ps-1 font-medium"
                    onFocus={(e) => e.currentTarget.select()}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {/* For mouse users who don't know Enter saves. Sits where
                      the row's "…" button is. Kept out of the Tab order:
                      leaving the field cancels the rename anyway. */}
                  <Button
                    size="icon"
                    variant="secondary"
                    // Fill the full height, like the field next to it.
                    className="bg-clip-border"
                    tabIndex={-1}
                    aria-label={t`Save`}
                    title={t`Save`}
                    // Keep focus in the field, so its blur doesn't cancel
                    // the rename before the click lands.
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      tree.completeRenaming();
                    }}
                  >
                    <CheckIcon />
                  </Button>
                </TreeItemLabel>
              </div>
            </TreeItem>
          );
        }

        return (
          <TreeItem
            key={id}
            item={item}
            // The row swapped back in after a rename is not a new row.
            className={cn(
              rowClassName,
              renamedItemRef.current !== id && rowEnterClassName
            )}
          >
            <TreeItemLabel
              aria-selected={isSelected}
              className={cn(
                // Keyboard focus: the app's thin primary ring, drawn inside
                // the row so it doesn't spill over its neighbours.
                'group w-full justify-between rounded-lg bg-card px-2 py-1 text-sm font-medium in-focus-visible:ring-2 in-focus-visible:ring-primary in-focus-visible:ring-inset',
                isSelected
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent'
              )}
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
                    // Wait for the menu to close and hand focus back before
                    // the field takes it, or the blur cancels the rename.
                    onRenameCategory={() =>
                      setTimeout(() => {
                        item.setFocused();
                        item.startRenaming();
                      })
                    }
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
    // A rename is applied optimistically: the row shows the new title at
    // once and falls back to the old one if the server rejects it. Moves wait
    // for the server.
    onMutate: async ({ id, title }) => {
      if (title === undefined) return;
      const queryKey = ['product-categories'];
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
        queryClient.setQueryData(['product-categories'], context.previous);
      }
      toast.error(t`Failed to update category`, {
        description: error.message
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
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

  const [search, setSearch] = React.useState('');
  const query = search.trim().toLowerCase();

  const { itemsMap } = React.useMemo(() => {
    const map: Record<string, TreeItemData> = {};
    const topLevelIds: string[] = [];
    const visibleCategories =
      categoriesQuery.data && query
        ? filterCategories(categoriesQuery.data, query)
        : categoriesQuery.data;

    if (visibleCategories) {
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

      visibleCategories.forEach((cat) => {
        topLevelIds.push(String(cat.id));
        addNode(cat);
      });
    }

    map.root = { name: 'root', children: topLevelIds };
    return { itemsMap: map };
  }, [categoriesQuery.data, query]);

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
    pendingDeleteCategory,
    openAddSubcategoryModal,
    closeAddSubcategoryModal,
    openAddRootCategoryModal,
    closeAddRootCategoryModal,
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
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="ms-5 h-10 w-3/5 rounded-lg" />
            <Skeleton className="ms-5 h-10 w-2/5 rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
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
          <ErrorState
            size="sm"
            title={<Trans>Failed to load categories</Trans>}
            message={categoriesQuery.error?.message}
            onRetry={() => categoriesQuery.refetch()}
            isRetrying={categoriesQuery.isRefetching}
          />
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
          {/* The empty state has its own, labelled button. */}
          {categoriesQuery.data && categoriesQuery.data.length > 0 && (
            <CardAction>
              <Button
                variant="secondary"
                size="icon-sm"
                className="bg-clip-border"
                aria-label={t`Add category`}
                title={t`Add category`}
                onClick={openAddRootCategoryModal}
              >
                <PlusIcon />
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {!categoriesQuery.data || categoriesQuery.data.length === 0 ? (
            <CategoriesEmptyState onAddCategory={openAddRootCategoryModal} />
          ) : (
            <>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={t`Search categories`}
                aria-label={t`Search categories`}
                wrapperClassName="mb-3"
              />
              {itemsMap.root?.children?.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  <Trans>No categories found</Trans>
                </p>
              ) : (
                <CategoriesTree
                  itemsMap={itemsMap}
                  categories={categoriesQuery.data}
                  selectedCategoryId={selectedCategoryId}
                  // While searching every match is shown expanded; the
                  // user's own expansion state comes back when it's cleared.
                  expandedItems={query ? Object.keys(itemsMap) : expandedItems}
                  setExpandedItems={query ? () => {} : setExpandedItems}
                  onSelect={handleCategorySelect}
                  onAddSubcategory={openAddSubcategoryModal}
                  onRenameCategory={(id, title) =>
                    updateCategoryMutation.mutate({ id, title })
                  }
                  onDeleteCategory={openDeleteCategoryModal}
                  onMoveCategory={handleMoveCategory}
                />
              )}
            </>
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
      <DeleteCategoryDialog
        open={pendingDeleteCategory != null}
        categoryTitle={pendingDeleteCategory?.title ?? ''}
        onOpenChange={(open) => !open && closeDeleteCategoryModal()}
        onConfirm={handleDeleteCategory}
      />
    </>
  );
}
