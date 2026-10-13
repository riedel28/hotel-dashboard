import { useLingui } from '@lingui/react/macro';
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  useTable
} from '@tanstack/react-table';
import { type ReactNode, useMemo } from 'react';
import type { Room } from 'shared/types/rooms';

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

import type { RoomSortColumn } from '../../-hooks/use-rooms-search';
import { RoomStatusCell } from '../room-status';
import { RowActions } from './row-actions';

interface RoomsTableProps {
  data: Room[];
  isLoading?: boolean;
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  pageCount?: number;
  sort?: { by: RoomSortColumn; order: 'asc' | 'desc' };
  onSortChange?: (by: RoomSortColumn, order: 'asc' | 'desc') => void;
  onPageChange?: (pageIndex: number, pageSize: number) => void;
  /** Set for those who may edit rooms; adds the row actions */
  onEdit?: (roomId: number) => void;
  emptyMessage?: ReactNode;
}

export default function RoomsTable({
  data,
  isLoading = false,
  pageIndex = 0,
  pageSize = 10,
  totalCount = 0,
  pageCount = 0,
  sort = { by: 'room_number', order: 'asc' },
  onSortChange,
  onPageChange,
  onEdit,
  emptyMessage
}: RoomsTableProps) {
  const { t } = useLingui();

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize]
  );
  const sorting = useMemo<SortingState>(
    () => [{ id: sort.by, desc: sort.order === 'desc' }],
    [sort.by, sort.order]
  );

  const columns = useMemo<ColumnDef<DataGridFeatures, Room>[]>(() => {
    const column = (
      id: RoomSortColumn,
      title: string,
      size: number,
      render: (room: Room) => ReactNode
    ): ColumnDef<DataGridFeatures, Room> => ({
      accessorKey: id,
      id,
      header: ({ column }) => (
        <DataGridColumnHeader title={title} visibility={true} column={column} />
      ),
      cell: ({ row }) => render(row.original),
      meta: {
        skeleton: <Skeleton className="h-6 w-20" />,
        headerTitle: title
      },
      size,
      enableSorting: true,
      enableHiding: true,
      enableResizing: true
    });

    return [
      column('room_number', t`Number`, 120, (room) => (
        <span className="font-medium">{room.room_number}</span>
      )),
      column('name', t`Name`, 200, (room) => room.name),
      column('room_type', t`Type`, 160, (room) => room.room_type || '—'),
      column('floor', t`Floor`, 100, (room) => (
        <span className="tabular-nums">{room.floor ?? '—'}</span>
      )),
      column('status', t`Status`, 130, (room) => (
        <RoomStatusCell status={room.status} />
      )),
      ...(onEdit
        ? [
            {
              id: 'actions',
              header: () => null,
              cell: ({ row }) => (
                <div className="flex justify-center">
                  <RowActions room={row.original} onEdit={onEdit} />
                </div>
              ),
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
            } satisfies ColumnDef<DataGridFeatures, Room>
          ]
        : [])
    ];
  }, [t, onEdit]);

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data,
    pageCount,
    getRowId: (row: Room) => row.id.toString(),
    state: { pagination, sorting },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(pagination) : updater;
      onPageChange?.(next.pageIndex, next.pageSize);
    },
    onSortingChange: (updater) => {
      const [next] = typeof updater === 'function' ? updater(sorting) : updater;
      if (next) {
        onSortChange?.(next.id as RoomSortColumn, next.desc ? 'desc' : 'asc');
      }
    },
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false
  });

  return (
    <DataGrid
      table={table}
      recordCount={totalCount}
      tableClassNames={{ edgeCell: 'px-5' }}
      tableLayout={{
        columnsPinnable: false,
        columnsMovable: false,
        columnsVisibility: false
      }}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
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
