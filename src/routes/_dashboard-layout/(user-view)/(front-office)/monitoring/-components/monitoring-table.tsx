import { useLingui } from '@lingui/react/macro';
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useTable
} from '@tanstack/react-table';
import { type ReactNode, useMemo } from 'react';
import type { MonitoringLog } from 'shared/types/monitoring';

import {
  DataGrid,
  DataGridContainer,
  type DataGridFeatures,
  dataGridFeatures
} from '@/components/ui/data-grid';
import { DataGridCards } from '@/components/ui/data-grid-cards';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { BookingCell } from './cells/booking-cell';
import { DateCell } from './cells/date-cell';
import { StatusCell } from './cells/status-cell';
import { TypeCell } from './cells/type-cell';

/**
 * A log as a phone card, led by the event the table would push off screen.
 * The event is a button stretched over the card, so all of it opens the log.
 */
function LogCard({
  log,
  onLogOpen
}: {
  log: MonitoringLog;
  onLogOpen: (logId: number) => void;
}) {
  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <div className="flex items-baseline gap-3">
        <button
          type="button"
          onClick={() => onLogOpen(log.id)}
          className="min-w-0 flex-1 cursor-pointer truncate text-left font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
        >
          {log.event}
        </button>
        <DateCell date={log.logged_at} />
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <StatusCell status={log.status} />
        <TypeCell type={log.type} />
        {log.booking_nr && (
          <span className="truncate text-xs text-muted-foreground">
            {log.booking_nr}
          </span>
        )}
      </div>
      {log.log_message && (
        <code className="block truncate font-mono text-xs text-muted-foreground">
          {log.log_message}
        </code>
      )}
    </div>
  );
}

interface MonitoringTableProps {
  data: MonitoringLog[];
  isLoading: boolean;
  totalCount: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  /** The log open in the details drawer, marked as the selected row. */
  selectedLogId: number | undefined;
  onLogOpen: (logId: number) => void;
  emptyMessage: ReactNode;
  /** A failed load (`LoadErrorState`), shown where the rows go. */
  error?: ReactNode;
}

export function MonitoringTable({
  data,
  isLoading,
  totalCount,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  selectedLogId,
  onLogOpen,
  emptyMessage,
  error
}: MonitoringTableProps) {
  const { t } = useLingui();

  const columns = useMemo<ColumnDef<DataGridFeatures, MonitoringLog>[]>(
    () => [
      {
        accessorKey: 'status',
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Status`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => <StatusCell status={row.original.status} />,
        meta: {
          skeleton: <Skeleton className="h-5 w-16" />,
          headerTitle: t`Status`
        },
        size: 90,
        enableSorting: true,
        enableHiding: true,
        enableResizing: false
      },
      {
        accessorKey: 'logged_at',
        id: 'logged_at',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Date`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => <DateCell date={row.original.logged_at} />,
        meta: {
          skeleton: <Skeleton className="h-5 w-24" />,
          headerTitle: t`Date`
        },
        // Fits "DD.MM HH:mm:ss"; a date from another year wraps to two lines
        size: 128,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'type',
        id: 'type',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Type`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => <TypeCell type={row.original.type} />,
        meta: {
          skeleton: <Skeleton className="h-5 w-20" />,
          headerTitle: t`Type`
        },
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'event',
        id: 'event',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Event`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => (
          // The keyboard way into the log; a mouse click anywhere on the row
          // bubbles to the same handler
          <button
            type="button"
            title={row.original.event}
            className="block max-w-full truncate rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {row.original.event}
          </button>
        ),
        meta: {
          skeleton: <Skeleton className="h-5 w-32" />,
          headerTitle: t`Event`
        },
        size: 150,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'booking_nr',
        id: 'booking_nr',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Reservation`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => (
          <BookingCell
            bookingNr={row.original.booking_nr}
            reservationId={row.original.reservation_id}
          />
        ),
        meta: {
          skeleton: <Skeleton className="h-5 w-24" />,
          headerTitle: t`Reservation`
        },
        // Fits a generated number (RES- plus eight characters); the filter
        // button overlays the cell and needs no room
        size: 140,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'log_message',
        id: 'log_message',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Message`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => (
          <code
            title={row.original.log_message ?? undefined}
            className="block truncate font-mono text-xs text-foreground"
          >
            {row.original.log_message || '—'}
          </code>
        ),
        meta: {
          skeleton: <Skeleton className="h-5 w-full rounded-md" />,
          headerTitle: t`Message`
        },
        size: 372,
        minSize: 300,
        enableSorting: false,
        enableHiding: true,
        enableResizing: true
      }
    ],
    [t]
  );

  const rowSelection = useMemo<RowSelectionState>(
    () => (selectedLogId === undefined ? {} : { [selectedLogId]: true }),
    [selectedLogId]
  );

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data,
    pageCount,
    getRowId: (row: MonitoringLog) => row.id.toString(),
    state: {
      pagination,
      sorting,
      rowSelection
    },
    // Selection only marks the log open in the details panel
    enableRowSelection: true,
    onPaginationChange,
    onSortingChange,
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false
  });

  return (
    <DataGrid
      error={error}
      table={table}
      recordCount={totalCount}
      onRowClick={(log) => onLogOpen(log.id)}
      tableClassNames={{
        edgeCell: 'px-5',
        // Lets cells reveal controls while their row is hovered. The open log
        // is tinted and marked with a bar on its left edge, so it stays easy
        // to find beside the drawer.
        bodyRow: cn(
          'group/row data-[state=selected]:bg-primary/10',
          'data-[state=selected]:*:first:before:absolute data-[state=selected]:*:first:before:inset-y-0 data-[state=selected]:*:first:before:left-0 data-[state=selected]:*:first:before:w-0.5 data-[state=selected]:*:first:before:bg-primary'
        )
      }}
      emptyMessage={emptyMessage}
      tableLayout={{
        columnsPinnable: false,
        columnsMovable: false,
        columnsVisibility: false
      }}
      isLoading={isLoading}
      skeletonRowCount={5}
    >
      <div className="w-full space-y-2.5">
        <DataGridContainer className="hidden sm:block">
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
        <DataGridCards<MonitoringLog>
          className="sm:hidden"
          renderCard={(log) => <LogCard log={log} onLogOpen={onLogOpen} />}
        />
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
