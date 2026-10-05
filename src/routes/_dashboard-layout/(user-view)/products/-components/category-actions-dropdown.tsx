import { Trans, useLingui } from '@lingui/react/macro';
import {
  CornerUpRightIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon
} from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { rootItemId, type TreeItems } from './category-tree-data';
import { destructiveMenuItemClassName } from './destructive-styles';

interface CategoryActionsDropdownProps {
  categoryId: number;
  // Current parent of this category; null when it is at the top level.
  parentId: number | null;
  // Every category of the property as tree items, used to pick a move target.
  items: TreeItems;
  onAddSubcategory: () => void;
  onRenameCategory: () => void;
  onDeleteCategory: () => void;
  onMoveCategory: (newParentId: number | null) => void;
}

interface MoveTargetsProps {
  items: TreeItems;
  // The item whose children are listed at this level.
  parentItemId: string;
  categoryId: number;
  parentId: number | null;
  onMove: (newParentId: number | null) => void;
}

// One level of move targets, mirroring the tree. A category with children
// opens a submenu whose first item ("Move here") targets the category itself.
// The category being moved (and so its whole subtree) and its current parent
// are shown but disabled.
function MoveTargets({
  items,
  parentItemId,
  categoryId,
  parentId,
  onMove
}: MoveTargetsProps) {
  return (items[parentItemId]?.children ?? []).map((itemId) => {
    const item = items[itemId];
    if (!item) return null;
    const id = Number(itemId);
    const title = <span className="truncate">{item.name}</span>;

    if (id === categoryId) {
      return (
        <DropdownMenuItem key={itemId} disabled>
          {title}
        </DropdownMenuItem>
      );
    }

    if (!item.children) {
      return (
        <DropdownMenuItem
          key={itemId}
          disabled={id === parentId}
          onClick={() => onMove(id)}
        >
          {title}
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuSub key={itemId}>
        <DropdownMenuSubTrigger>{title}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-auto max-w-72 min-w-40">
          <DropdownMenuItem
            disabled={id === parentId}
            onClick={() => onMove(id)}
          >
            <Trans>Move here</Trans>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <MoveTargets
            items={items}
            parentItemId={itemId}
            categoryId={categoryId}
            parentId={parentId}
            onMove={onMove}
          />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  });
}

export function CategoryActionsDropdown({
  categoryId,
  parentId,
  items,
  onAddSubcategory,
  onRenameCategory,
  onDeleteCategory,
  onMoveCategory
}: CategoryActionsDropdownProps) {
  const { t } = useLingui();
  return (
    // Revealed on hover or focus; always visible on touch screens, which have
    // no hover.
    <span className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 has-data-popup-open:opacity-100 pointer-coarse:opacity-100">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ size: 'icon', variant: 'ghost' }))}
          aria-label={t`Category actions`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreHorizontalIcon className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="right"
          onClick={(e) => e.stopPropagation()}
          className="w-auto max-w-72 min-w-40"
        >
          <DropdownMenuItem onClick={onAddSubcategory}>
            <PlusIcon className="mr-2 size-4" />
            <Trans>Add subcategory</Trans>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRenameCategory}>
            <PencilIcon className="mr-2 size-4" />
            <Trans>Rename category</Trans>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CornerUpRightIcon className="mr-2 size-4" />
              <Trans>Move to category</Trans>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              className="w-auto max-w-72 min-w-40"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                disabled={parentId == null}
                onClick={() => onMoveCategory(null)}
              >
                <Trans>Top level</Trans>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <MoveTargets
                items={items}
                parentItemId={rootItemId}
                categoryId={categoryId}
                parentId={parentId}
                onMove={onMoveCategory}
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={destructiveMenuItemClassName}
            onClick={onDeleteCategory}
          >
            <Trash2Icon className="mr-2 size-4" />
            <Trans>Delete category</Trans>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}
