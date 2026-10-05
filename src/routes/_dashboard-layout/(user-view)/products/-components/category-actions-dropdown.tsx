import { Trans, useLingui } from '@lingui/react/macro';
import {
  CornerUpRightIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon
} from 'lucide-react';

import type { NestedProductCategory } from '@/api/product-categories';
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

import { destructiveMenuItemClassName } from './destructive-styles';

interface CategoryActionsDropdownProps {
  categoryId: number;
  // Current parent of this category; null when it is at the top level.
  parentId: number | null;
  // Full category tree, used to pick a move target.
  categories: NestedProductCategory[];
  onAddSubcategory: () => void;
  onRenameCategory: () => void;
  onDeleteCategory: () => void;
  onMoveCategory: (newParentId: number | null) => void;
}

interface MoveTargetsProps {
  nodes: NestedProductCategory[];
  categoryId: number;
  parentId: number | null;
  onMove: (newParentId: number | null) => void;
}

// One level of move targets, mirroring the tree. A category with children
// opens a submenu whose first item ("Move here") targets the category itself.
// The category being moved (and so its whole subtree) and its current parent
// are shown but disabled.
function MoveTargets({
  nodes,
  categoryId,
  parentId,
  onMove
}: MoveTargetsProps) {
  return nodes.map((node) => {
    if (node.id === categoryId) {
      return (
        <DropdownMenuItem key={node.id} disabled>
          <span className="truncate">{node.title}</span>
        </DropdownMenuItem>
      );
    }

    if (node.children.length === 0) {
      return (
        <DropdownMenuItem
          key={node.id}
          disabled={node.id === parentId}
          onClick={() => onMove(node.id)}
        >
          <span className="truncate">{node.title}</span>
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuSub key={node.id}>
        <DropdownMenuSubTrigger>
          <span className="truncate">{node.title}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-auto max-w-72 min-w-40">
          <DropdownMenuItem
            disabled={node.id === parentId}
            onClick={() => onMove(node.id)}
          >
            <Trans>Move here</Trans>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <MoveTargets
            nodes={node.children}
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
  categories,
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
                nodes={categories}
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
