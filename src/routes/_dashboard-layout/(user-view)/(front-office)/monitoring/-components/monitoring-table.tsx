import { useLingui } from '@lingui/react/macro';
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import type { MonitoringLog } from 'shared/types/monitoring';

import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import { DateCell } from './cells/date-cell';
import { StatusCell } from './cells/status-cell';
import { TypeCell } from './cells/type-cell';

interface MonitoringTableProps {
  data: MonitoringLog[];
  isLoading?: boolean;
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  pageCount?: number;
  onPaginationChange?: (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) => void;
  sorting?: SortingState;
  onSortingChange?: (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => void;
}

export function MonitoringTable({
  data,
  isLoading = false,
  pageIndex = 0,
  pageSize = 10,
  totalCount = 0,
  pageCount = 0,
  onPaginationChange,
  sorting: sortingProp,
  onSortingChange
}: MonitoringTableProps) {
  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex,
      pageSize
    }),
    [pageIndex, pageSize]
  );

  const [internalSorting, setInternalSorting] = useState<SortingState>([
    { id: 'logged_at', desc: true }
  ]);
  const sorting = sortingProp ?? internalSorting;
  const { t } = useLingui();

  const columns = useMemo<ColumnDef<MonitoringLog>[]>(
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
          skeleton: <Skeleton className="h-6 w-16" />,
          headerTitle: t`Status`
        },
        size: 80,
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
          skeleton: <Skeleton className="h-6 w-24" />,
          headerTitle: t`Date`
        },
        size: 150,
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
          skeleton: <Skeleton className="h-6 w-20" />,
          headerTitle: t`Type`
        },
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'booking_nr',
        id: 'booking_nr',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Booking #`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => <span>{row.original.booking_nr || '-'}</span>,
        meta: {
          skeleton: <Skeleton className="h-6 w-24" />,
          headerTitle: t`Booking #`
        },
        size: 130,
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
        cell: ({ row }) => <span>{row.original.event}</span>,
        meta: {
          skeleton: <Skeleton className="h-6 w-32" />,
          headerTitle: t`Event`
        },
        size: 200,
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
          <div className="font-mono text-xs text-foreground bg-muted/50 rounded-md p-2">
            {row.original.log_message || '-'}
          </div>
        ),
        meta: {
          skeleton: <Skeleton className="h-6 w-full" />,
          headerTitle: t`Message`
        },
        size: 300,
        enableSorting: false,
        enableHiding: true,
        enableResizing: true
      }
    ],
    [t]
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const table = useReactTable({
    columns,
    data: data || [],
    pageCount: pageCount,
    getRowId: (row: MonitoringLog) => row.id.toString(),
    state: {
      pagination,
      sorting,
      columnOrder
    },
    onPaginationChange: onPaginationChange,
    onSortingChange: onSortingChange ?? setInternalSorting,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false
  });

  return (
    <DataGrid
      table={table}
      recordCount={totalCount}
      tableClassNames={{
        edgeCell: 'px-5'
      }}
      tableLayout={{
        columnsPinnable: false,
        columnsMovable: false,
        columnsVisibility: false
      }}
      isLoading={isLoading}
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
