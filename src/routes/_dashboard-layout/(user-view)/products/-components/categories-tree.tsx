import type { ItemInstance } from '@headless-tree/core';
import {
  hotkeysCoreFeature,
  renamingFeature,
  syncDataLoaderFeature
} from '@headless-tree/core';
import { useTree } from '@headless-tree/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

import type { ProductCategory } from '@/api/product-categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tree, TreeItem, TreeItemLabel } from '@/components/ui/tree';
import { cn } from '@/lib/utils';

import { CategoryActionsDropdown } from './category-actions-dropdown';
import {
  buildTreeItems,
  filterCategories,
  parentItemId,
  rootItemId,
  type TreeItemData
} from './category-tree-data';

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
  // Every category of the property, flat.
  categories: ProductCategory[];
  // Lower-cased search text. While it is set, only matching branches are
  // shown and all of them are expanded.
  query: string;
  selectedCategoryId: number | null;
  expandedItems: string[];
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
  onSelect: (categoryId: number) => void;
  // Called when a selectable category is hovered or focused.
  onPrefetch: (categoryId: number) => void;
  onAddSubcategory: (categoryId: number) => void;
  onRenameCategory: (categoryId: number, title: string) => void;
  onDeleteCategory: (category: ProductCategory) => void;
  onMoveCategory: (categoryId: number, newParentId: number | null) => void;
}

// Declared at module level so it keeps its identity (and the tree its DOM)
// across parent renders; expansion state is owned by the parent.
export function CategoriesTree({
  categories,
  query,
  selectedCategoryId,
  expandedItems: userExpandedItems,
  setExpandedItems,
  onSelect,
  onPrefetch,
  onAddSubcategory,
  onRenameCategory,
  onDeleteCategory,
  onMoveCategory
}: CategoriesTreeProps) {
  const { t } = useLingui();
  const isSearching = query !== '';

  // Every category as tree items; the "Move to category" menu mirrors it.
  const allItems = React.useMemo(
    () => buildTreeItems(categories),
    [categories]
  );
  // What the tree shows: everything, or the matching branches.
  const { itemsMap, byItemId } = React.useMemo(() => {
    const visible = isSearching
      ? filterCategories(categories, query)
      : categories;
    return {
      itemsMap: isSearching ? buildTreeItems(visible) : allItems,
      byItemId: new Map(visible.map((c) => [String(c.id), c]))
    };
  }, [categories, query, isSearching, allItems]);

  // Memoized: headless-tree treats a new array as a state change and
  // re-renders, so an array built on every render would loop.
  const expandedItems = React.useMemo(
    () => (isSearching ? Object.keys(itemsMap) : userExpandedItems),
    [isSearching, itemsMap, userExpandedItems]
  );

  // The Tab stop must be a row that is actually rendered. headless-tree keeps
  // pointing at the last focused item even after it is filtered out by the
  // search or hidden in a collapsed folder, which leaves the tree unreachable
  // by keyboard — so fall back to the selected category, then to the first row.
  const [focusedItem, setFocusedItem] = React.useState<string | null>(null);
  const isRendered = (itemId: string | null): itemId is string => {
    const category = itemId == null ? undefined : byItemId.get(itemId);
    if (!category) return false;
    const parentId = parentItemId(category);
    return (
      parentId === rootItemId ||
      (expandedItems.includes(parentId) && isRendered(parentId))
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
    // Folding is the user's own state; a search leaves it untouched and
    // shows it again once cleared.
    setExpandedItems: (updater) => {
      if (!isSearching) setExpandedItems(updater);
    },
    setFocusedItem,
    // Fires on click and on Enter/Space. Folders are toggled by headless-tree
    // itself; leaves select.
    onPrimaryAction: (item) => {
      if (!item.isFolder()) {
        onSelect(Number(item.getId()));
      }
    },
    indent,
    rootItemId,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData().children?.length ?? 0) > 0,
    dataLoader: {
      // headless-tree may still ask for a category that was just removed.
      getItem: (itemId) => itemsMap[itemId] ?? { name: '' },
      getChildren: (itemId) => itemsMap[itemId]?.children ?? []
    },
    // Inline rename: started from the row menu or with F2, Enter saves,
    // Escape or leaving the field cancels.
    onRename: (item, value) => {
      const title = value.trim();
      if (title && title !== item.getItemName()) {
        onRenameCategory(Number(item.getId()), title);
      }
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, renamingFeature]
  });

  // Pick up added, removed or renamed categories without remounting.
  React.useEffect(() => {
    tree.rebuildTree();
  }, [tree, itemsMap]);

  if (byItemId.size === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        <Trans>No categories found</Trans>
      </p>
    );
  }

  return (
    <Tree indent={indent} tree={tree}>
      {tree.getItems().map((item: ItemInstance<TreeItemData>) => {
        const category = byItemId.get(item.getId());
        if (!category) return null;
        const isSelected = selectedCategoryId === category.id;
        const isLeaf = !item.isFolder();

        return (
          // A div, not the default button: the row holds a menu button and,
          // while renaming, a text field — neither may sit inside a button.
          <TreeItem
            key={category.id}
            item={item}
            asChild
            className={cn(rowClassName, rowEnterClassName)}
            // Start loading a category's products before it is clicked.
            {...(isLeaf && {
              onMouseEnter: () => onPrefetch(category.id),
              onFocus: () => onPrefetch(category.id)
            })}
          >
            <div
              // What a button would do natively: Enter/Space activate the row.
              onKeyDown={(event) => {
                if (
                  event.target === event.currentTarget &&
                  (event.key === 'Enter' || event.key === ' ')
                ) {
                  event.preventDefault();
                  event.currentTarget.click();
                }
              }}
            >
              {item.isRenaming() ? (
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
              ) : (
                <TreeItemLabel
                  aria-selected={isSelected}
                  className={cn(
                    // Keyboard focus: the app's thin primary ring, drawn
                    // inside the row so it doesn't spill over its neighbours.
                    'group w-full justify-between rounded-lg bg-card px-2 py-1 text-sm font-medium in-focus-visible:ring-2 in-focus-visible:ring-primary in-focus-visible:ring-inset',
                    isSelected
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent'
                  )}
                >
                  <div className="flex w-full min-w-0 items-center justify-between gap-1">
                    <span className="truncate" title={category.title}>
                      {category.title}
                    </span>

                    <CategoryActionsDropdown
                      categoryId={category.id}
                      parentId={category.parent_id}
                      items={allItems}
                      onAddSubcategory={() => onAddSubcategory(category.id)}
                      // Wait for the menu to close and hand focus back before
                      // the field takes it, or the blur cancels the rename.
                      onRenameCategory={() =>
                        setTimeout(() => {
                          item.setFocused();
                          item.startRenaming();
                        })
                      }
                      onDeleteCategory={() => onDeleteCategory(category)}
                      onMoveCategory={(newParentId) =>
                        onMoveCategory(category.id, newParentId)
                      }
                    />
                  </div>
                </TreeItemLabel>
              )}
            </div>
          </TreeItem>
        );
      })}
    </Tree>
  );
}
