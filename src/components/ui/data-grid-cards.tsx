import { Trans } from '@lingui/react/macro';
import type { RowData } from '@tanstack/react-table';
import type { MouseEvent, ReactNode } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useDataGrid } from './data-grid';

/**
 * The grid's rows as cards, for screens too narrow for its table. Inside a
 * `DataGrid`, it shows what the table shows — the same rows, loading state,
 * empty message and failed load — so only the card's content is the caller's.
 *
 * A card opens its row through a link stretched over it
 * (`after:absolute after:inset-0`); controls inside need `relative` to sit
 * above that link.
 */
function DataGridCards<TData extends RowData>({
  renderCard,
  className
}: {
  renderCard: (row: TData) => ReactNode;
  className?: string;
}) {
  const { table, props, isLoading } = useDataGrid<TData>();

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[0, 1, 2, 3, 4].map((key) => (
          <Skeleton key={key} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const rows = props.error ? [] : table.getRowModel().rows;
  if (rows.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border px-4 py-8 text-center text-sm text-muted-foreground',
          className
        )}
      >
        {props.error || props.emptyMessage || <Trans>No data available</Trans>}
      </div>
    );
  }

  return (
    <ul className={cn('divide-y rounded-lg border', className)}>
      {rows.map((row) => (
        <li
          key={row.id}
          className="relative flex items-start gap-3 p-4 hover:bg-muted/40"
        >
          {renderCard(row.original)}
        </li>
      ))}
    </ul>
  );
}

/**
 * For links and menus inside a clickable row: keeps their click from also
 * opening the row (`DataGrid`'s `onRowClick`). React bubbles a portalled
 * popover's clicks to the row as well, so popover content needs it too.
 */
function stopRowClick(event: MouseEvent) {
  event.stopPropagation();
}

export { DataGridCards, stopRowClick };
