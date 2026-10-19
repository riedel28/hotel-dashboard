import { useLingui } from '@lingui/react/macro';
import {
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useTable
} from '@tanstack/react-table';
import { type ReactNode, useMemo } from 'react';
import type { Room } from 'shared/types/rooms';

import { openRowClassName } from '@/components/details-drawer';
import {
  DataGrid,
  DataGridContainer,
  type DataGridFeatures,
  dataGridFeatures
} from '@/components/ui/data-grid';
import { stopRowClick } from '@/components/ui/data-grid-cards';
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
  /** Set for those who may edit rooms; adds the row actions and opens a
      clicked row in the form */
  onEdit?: (roomId: number) => void;
  /** The room open in the form, marked as the selected row. */
  selectedRoomId?: number;
  emptyMessage?: ReactNode;
  /** A failed load (`LoadErrorState`), shown where the rows go. */
  error?: ReactNode;
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
  selectedRoomId,
  emptyMessage,
  error
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
                // The menu and its dialog keep their clicks from opening the row
                <div className="flex justify-center" onClick={stopRowClick}>
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

  const rowSelection = useMemo<RowSelectionState>(
    () => (selectedRoomId === undefined ? {} : { [selectedRoomId]: true }),
    [selectedRoomId]
  );

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data,
    pageCount,
    getRowId: (row: Room) => row.id.toString(),
    state: { pagination, sorting, rowSelection },
    // Selection only marks the room open in the form
    enableRowSelection: true,
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
      error={error}
      table={table}
      recordCount={totalCount}
      onRowClick={onEdit ? (room: Room) => onEdit(room.id) : undefined}
      tableClassNames={{ edgeCell: 'px-5', bodyRow: openRowClassName }}
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
