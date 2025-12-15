import { Trans, useLingui } from '@lingui/react/macro';
import { type Column } from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowLeft,
  ArrowLeftToLine,
  ArrowRight,
  ArrowRightToLine,
  ArrowUp,
  Check,
  ChevronDownIcon,
  ChevronsUpDown,
  ChevronUpIcon,
  PinOff,
  Settings2
} from 'lucide-react';
import { type HTMLAttributes, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { useDataGrid } from '@/components/ui/data-grid';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';

interface DataGridColumnHeaderProps<TData, TValue>
  extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title?: string;
  icon?: ReactNode;
  pinnable?: boolean;
  filter?: ReactNode;
  visibility?: boolean;
}

function DataGridColumnHeader<TData, TValue>({
  column,
  title = '',
  icon,
  className,
  filter,
  visibility = false
}: DataGridColumnHeaderProps<TData, TValue>) {
  const { isLoading, table, props, recordCount } = useDataGrid();
  const { t } = useLingui();

  const moveColumn = (direction: 'left' | 'right') => {
    const currentOrder = [...table.getState().columnOrder]; // Get current column order
    const currentIndex = currentOrder.indexOf(column.id); // Get current index of the column

    if (direction === 'left' && currentIndex > 0) {
      // Move column left
      const newOrder = [...currentOrder];
      const [movedColumn] = newOrder.splice(currentIndex, 1);
      if (movedColumn) {
        newOrder.splice(currentIndex - 1, 0, movedColumn);
        table.setColumnOrder(newOrder); // Update column order
      }
    }

    if (direction === 'right' && currentIndex < currentOrder.length - 1) {
      // Move column right
      const newOrder = [...currentOrder];
      const [movedColumn] = newOrder.splice(currentIndex, 1);
      if (movedColumn) {
        newOrder.splice(currentIndex + 1, 0, movedColumn);
        table.setColumnOrder(newOrder); // Update column order
      }
    }
  };

  const canMove = (direction: 'left' | 'right'): boolean => {
    const currentOrder = table.getState().columnOrder;
    const currentIndex = currentOrder.indexOf(column.id);
    if (direction === 'left') {
      return currentIndex > 0;
    } else {
      return currentIndex < currentOrder.length - 1;
    }
  };

  const headerLabel = () => {
    return (
      <div
        className={cn(
          'inline-flex h-full items-center gap-1.5 text-[0.8125rem] leading-[calc(1.125/0.8125)] font-medium text-muted-foreground [&_svg]:size-3.5 [&_svg]:opacity-60',
          className
        )}
      >
        {icon && icon}
        {title}
      </div>
    );
  };

  const headerButton = (triggerProps?: React.ComponentProps<'button'>) => {
    const { onClick: triggerOnClick, ...restTriggerProps } = triggerProps || {};
    return (
      <Button
        variant="ghost"
        className={cn(
          '-ms-2 h-8 rounded-md px-2 text-[13px] font-medium text-muted-foreground hover:bg-secondary hover:text-muted-foreground data-[state=open]:bg-secondary data-[state=open]:text-foreground',
          className
        )}
        disabled={isLoading || recordCount === 0}
        onClick={(e) => {
          triggerOnClick?.(e);
          const isSorted = column.getIsSorted();
          if (isSorted === 'asc') {
            column.toggleSorting(true);
          } else if (isSorted === 'desc') {
            column.clearSorting();
          } else {
            column.toggleSorting(false);
          }
        }}
        {...restTriggerProps}
      >
        {icon && icon}
        {title}

        {column.getCanSort() &&
          (column.getIsSorted() === 'desc' ? (
            <ChevronDownIcon className="mt-px size-4" />
          ) : column.getIsSorted() === 'asc' ? (
            <ChevronUpIcon className="mt-px size-4" />
          ) : (
            <ChevronsUpDown className="mt-px size-3.5" />
          ))}
      </Button>
    );
  };

  const headerPin = () => {
    const unpinLabel = t`Unpin {title} column`;

    return (
      <Button
        size="icon-sm"
        variant="ghost"
        className="-me-1 size-7 rounded-md"
        onClick={() => column.pin(false)}
        aria-label={unpinLabel}
        title={unpinLabel}
      >
        <PinOff className="size-3.5! opacity-50!" aria-hidden="true" />
      </Button>
    );
  };

  const headerControls = () => {
    return (
      <div className="flex h-full items-center justify-between gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            nativeButton
            render={(props) => headerButton(props)}
          />
          <DropdownMenuContent className="w-40" align="start">
            {filter && <DropdownMenuLabel>{filter}</DropdownMenuLabel>}

            {filter &&
              (column.getCanSort() || column.getCanPin() || visibility) && (
                <DropdownMenuSeparator />
              )}

            {column.getCanSort() && (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    if (column.getIsSorted() === 'asc') {
                      column.clearSorting();
                    } else {
                      column.toggleSorting(false);
                    }
                  }}
                  disabled={!column.getCanSort()}
                >
                  <ArrowUp className="size-3.5!" />
                  <span className="grow">
                    <Trans>Asc</Trans>
                  </span>
                  {column.getIsSorted() === 'asc' && (
                    <Check className="size-4 text-primary opacity-100!" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (column.getIsSorted() === 'desc') {
                      column.clearSorting();
                    } else {
                      column.toggleSorting(true);
                    }
                  }}
                  disabled={!column.getCanSort()}
                >
                  <ArrowDown className="size-3.5!" />
                  <span className="grow">
                    <Trans>Desc</Trans>
                  </span>
                  {column.getIsSorted() === 'desc' && (
                    <Check className="size-4 text-primary opacity-100!" />
                  )}
                </DropdownMenuItem>
              </>
            )}

            {(filter || column.getCanSort()) &&
              (column.getCanSort() || column.getCanPin() || visibility) && (
                <DropdownMenuSeparator />
              )}

            {props.tableLayout?.columnsPinnable && column.getCanPin() && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    column.pin(column.getIsPinned() === 'left' ? false : 'left')
                  }
                >
                  <ArrowLeftToLine className="size-3.5!" aria-hidden="true" />
                  <span className="grow">
                    <Trans>Pin to left</Trans>
                  </span>
                  {column.getIsPinned() === 'left' && (
                    <Check className="size-4 text-primary opacity-100!" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    column.pin(
                      column.getIsPinned() === 'right' ? false : 'right'
                    )
                  }
                >
                  <ArrowRightToLine className="size-3.5!" aria-hidden="true" />
                  <span className="grow">
                    <Trans>Pin to right</Trans>
                  </span>
                  {column.getIsPinned() === 'right' && (
                    <Check className="size-4 text-primary opacity-100!" />
                  )}
                </DropdownMenuItem>
              </>
            )}

            {props.tableLayout?.columnsMovable && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => moveColumn('left')}
                  disabled={!canMove('left') || column.getIsPinned() !== false}
                >
                  <ArrowLeft className="size-3.5!" aria-hidden="true" />
                  <span>
                    <Trans>Move to Left</Trans>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => moveColumn('right')}
                  disabled={!canMove('right') || column.getIsPinned() !== false}
                >
                  <ArrowRight className="size-3.5!" aria-hidden="true" />
                  <span>
                    <Trans>Move to Right</Trans>
                  </span>
                </DropdownMenuItem>
              </>
            )}

            {props.tableLayout?.columnsVisibility &&
              visibility &&
              (column.getCanSort() || column.getCanPin() || filter) && (
                <DropdownMenuSeparator />
              )}

            {props.tableLayout?.columnsVisibility && visibility && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Settings2 className="size-3.5!" />
                  <span>
                    <Trans>Columns</Trans>
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {table
                      .getAllColumns()
                      .filter(
                        (col) =>
                          typeof col.accessorFn !== 'undefined' &&
                          col.getCanHide()
                      )
                      .map((col) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={col.id}
                            checked={col.getIsVisible()}
                            onSelect={(event) => event.preventDefault()}
                            onCheckedChange={(value) =>
                              col.toggleVisibility(!!value)
                            }
                            className="capitalize"
                          >
                            {col.columnDef.meta?.headerTitle || col.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {props.tableLayout?.columnsPinnable &&
          column.getCanPin() &&
          column.getIsPinned() &&
          headerPin()}
      </div>
    );
  };

  if (
    props.tableLayout?.columnsMovable ||
    (props.tableLayout?.columnsVisibility && visibility) ||
    (props.tableLayout?.columnsPinnable && column.getCanPin()) ||
    filter
  ) {
    return headerControls();
  }

  if (
    column.getCanSort() ||
    (props.tableLayout?.columnsResizable && column.getCanResize())
  ) {
    return <div className="flex h-full items-center">{headerButton()}</div>;
  }

  return headerLabel();
}

export { DataGridColumnHeader, type DataGridColumnHeaderProps };
