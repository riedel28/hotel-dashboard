import { Trans, useLingui } from '@lingui/react/macro';
import {
  ArrowUpIcon,
  ArrowUpRightIcon,
  EyeOffIcon,
  FileTextIcon,
  GripVerticalIcon,
  PlusIcon
} from 'lucide-react';
import type { CmsNodeType } from 'shared/types/cms';

import type { CmsNode } from '@/api/cms';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { moveItem, useDragReorder } from '@/hooks/use-drag-reorder';
import { cn } from '@/lib/utils';

// A page's children: open, reorder (drag or Move up) or add one.
export function NestedItems({
  parent,
  items,
  titleOf,
  onSelect,
  onAddChild,
  onReorder
}: {
  parent: CmsNode;
  items: CmsNode[];
  titleOf: (node: CmsNode) => string;
  onSelect: (id: number) => void;
  onAddChild: (node: CmsNode, type: CmsNodeType) => void;
  onReorder: (node: CmsNode, index: number) => void;
}) {
  const { t } = useLingui();
  const { itemProps } = useDragReorder((from, to) => {
    const moved = items[from];
    if (moved) onReorder(moved, moveItem(items, from, to).indexOf(moved));
  });

  return (
    <section aria-labelledby="cms-nested" className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 id="cms-nested" className="text-sm font-medium">
          <Trans>Nested items</Trans>
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button type="button" size="sm" variant="outline" />}
          >
            <PlusIcon />
            <Trans>Add</Trans>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddChild(parent, 'page')}>
              <FileTextIcon />
              <Trans>Page</Trans>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddChild(parent, 'link')}>
              <ArrowUpRightIcon />
              <Trans>External link</Trans>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          <Trans>No nested items.</Trans>
        </p>
      ) : (
        <ul className="divide-y rounded-lg border" aria-label={t`Nested items`}>
          {items.map((item, index) => (
            <li
              key={item.id}
              {...itemProps(index)}
              className="flex items-center gap-2 px-2 py-1.5 text-sm data-dragging:opacity-40 data-drop-target:bg-accent"
            >
              <GripVerticalIcon
                className="size-4 cursor-grab text-muted-foreground"
                aria-hidden
              />
              {item.type === 'link' ? (
                <ArrowUpRightIcon className="size-4 text-muted-foreground" />
              ) : (
                <FileTextIcon className="size-4 text-muted-foreground" />
              )}
              <button
                type="button"
                className={cn(
                  'min-w-0 flex-1 truncate text-start underline-offset-4 hover:underline',
                  item.hidden && 'text-muted-foreground'
                )}
                onClick={() => onSelect(item.id)}
              >
                {titleOf(item)}
              </button>
              {item.hidden && (
                <EyeOffIcon
                  className="size-4 text-muted-foreground"
                  role="img"
                  aria-label={t`Hidden`}
                />
              )}
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label={t`Move up`}
                disabled={index === 0}
                onClick={() => onReorder(item, index - 1)}
              >
                <ArrowUpIcon />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
