import { Trans } from '@lingui/react/macro';
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

interface CategoryActionsDropdownProps {
  categoryId: number;
  categoryTitle: string;
  // Current parent of this category; null when it is at the top level.
  parentId: number | null;
  // Full category tree, used to pick a move target.
  categories: NestedProductCategory[];
  onAddSubcategory: (categoryId: number) => void;
  onEditCategory: (categoryId: number, initialTitle: string) => void;
  onDeleteCategory: (categoryId: number, title: string) => void;
  onMoveCategory: (categoryId: number, newParentId: number | null) => void;
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
        <DropdownMenuSubContent className="w-48">
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
  categoryTitle,
  parentId,
  categories,
  onAddSubcategory,
  onEditCategory,
  onDeleteCategory,
  onMoveCategory
}: CategoryActionsDropdownProps) {
  return (
    <span className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 has-data-popup-open:opacity-100">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ size: 'icon', variant: 'ghost' }))}
          aria-label="Category actions"
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
          className="w-48"
        >
          <DropdownMenuItem
            onClick={() => {
              onAddSubcategory(categoryId);
            }}
          >
            <PlusIcon className="mr-2 size-4" />
            <Trans>Add subcategory</Trans>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onEditCategory(categoryId, categoryTitle);
            }}
          >
            <PencilIcon className="mr-2 size-4" />
            <Trans>Edit category</Trans>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CornerUpRightIcon className="mr-2 size-4" />
              <Trans>Move to category</Trans>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              className="w-48"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                disabled={parentId == null}
                onClick={() => onMoveCategory(categoryId, null)}
              >
                <Trans>Top level</Trans>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <MoveTargets
                nodes={categories}
                categoryId={categoryId}
                parentId={parentId}
                onMove={(newParentId) =>
                  onMoveCategory(categoryId, newParentId)
                }
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="focus:bg-destructive/10 focus:text-danger focus:**:text-danger!"
            onClick={() => {
              onDeleteCategory(categoryId, categoryTitle);
            }}
          >
            <Trash2Icon className="mr-2 size-4" />
            <Trans>Delete category</Trans>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}
