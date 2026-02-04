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
import type { Room } from 'shared/types/rooms';

import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import { RoomStatusCell } from './-components/cells/room-status-cell';
import { RowActions } from './row-actions';

interface RoomsTableProps {
  data: Room[];
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

export default function RoomsTable({
  data,
  isLoading = false,
  pageIndex = 0,
  pageSize = 20,
  totalCount = 0,
  pageCount = 0,
  onPaginationChange,
  sorting: sortingProp,
  onSortingChange
}: RoomsTableProps) {
  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex,
      pageSize
    }),
    [pageIndex, pageSize]
  );

  const [internalSorting, setInternalSorting] = useState<SortingState>([
    { id: 'name', desc: false }
  ]);
  const sorting = sortingProp ?? internalSorting;
  const { t } = useLingui();

  const columns = useMemo<ColumnDef<Room>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Name`}
            visibility={true}
            column={column}
          />
        ),
        cell: (info) => <span>{info.getValue() as string}</span>,
        meta: {
          skeleton: <Skeleton className="h-6 w-32" />,
          headerTitle: t`Name`
        },
        size: 200,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'room_number',
        id: 'room_number',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Room Number`}
            visibility={true}
            column={column}
          />
        ),
        cell: (info) => {
          const value = info.getValue() as string | null;
          return <span>{value || '-'}</span>;
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-20" />,
          headerTitle: t`Room Number`
        },
        size: 140,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'room_type',
        id: 'room_type',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Room Type`}
            visibility={true}
            column={column}
          />
        ),
        cell: (info) => {
          const value = info.getValue() as string | null;
          return <span>{value || '-'}</span>;
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-24" />,
          headerTitle: t`Room Type`
        },
        size: 150,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
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
        cell: ({ row }) => {
          const status = row.getValue('status') as Room['status'];
          return <RoomStatusCell status={status} />;
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-16" />,
          headerTitle: t`Status`
        },
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: false
      },
      {
        accessorKey: 'actions',
        id: 'actions',
        header: () => null,
        cell: ({ row }) => {
          return (
            <div className="flex justify-center">
              <RowActions row={row} />
            </div>
          );
        },
        meta: {
          skeleton: (
            <div className="flex items-center justify-center">
              <Skeleton className="h-6 w-6" />
            </div>
          )
        },
        size: 70,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false
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
    getRowId: (row: Room) => row.id.toString(),
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
