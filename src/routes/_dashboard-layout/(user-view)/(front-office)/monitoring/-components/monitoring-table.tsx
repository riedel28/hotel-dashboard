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
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import { BookingCell } from './cells/booking-cell';
import { DateCell } from './cells/date-cell';
import { StatusCell } from './cells/status-cell';
import { TypeCell } from './cells/type-cell';

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
  emptyMessage
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
        // Fits a generated number (RES- plus eight characters) and the filter
        size: 168,
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
            {row.original.log_message || '-'}
          </code>
        ),
        meta: {
          skeleton: <Skeleton className="h-5 w-full rounded-md" />,
          headerTitle: t`Message`
        },
        size: 344,
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
      table={table}
      recordCount={totalCount}
      onRowClick={(log) => onLogOpen(log.id)}
      tableClassNames={{
        edgeCell: 'px-5'
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
        <DataGridContainer>
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
