import { Trans } from '@lingui/react/macro';
import {
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface CategoryActionsDropdownProps {
  categoryId: number;
  categoryTitle: string;
  onAddSubcategory: (categoryId: number) => void;
  onEditCategory: (categoryId: number, initialTitle: string) => void;
  onDeleteCategory: (categoryId: number, title: string) => void;
}

export function CategoryActionsDropdown({
  categoryId,
  categoryTitle,
  onAddSubcategory,
  onEditCategory,
  onDeleteCategory
}: CategoryActionsDropdownProps) {
  return (
    <span className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Category actions"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="right"
          onClick={(e) => e.stopPropagation()}
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
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
