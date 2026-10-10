import { useLingui } from '@lingui/react/macro';
import {
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useTable
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import type { Reservation } from '@/api/reservations';
import {
  DataGrid,
  DataGridContainer,
  type DataGridFeatures,
  dataGridFeatures
} from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Skeleton } from '@/components/ui/skeleton';

import { BalanceCell } from './-components/cells/balance-cell';
import { GuestsCell } from './-components/cells/guests-cell';
import { ReservationNrCell } from './-components/cells/reservation-nr-cell';
import { StatusCell } from './-components/cells/status-cell';
import { RowActions } from './row-actions';

/** A stay date on one line: the year only when it is not the current one. */
function StayDateCell({ date }: { date: Date | string }) {
  const value = dayjs(date);
  const isCurrentYear = value.year() === dayjs().year();

  return (
    <time
      dateTime={value.toISOString()}
      title={value.format('DD.MM.YYYY HH:mm')}
      className="text-[13px] whitespace-nowrap tabular-nums"
    >
      {value.format(isCurrentYear ? 'DD.MM' : 'DD.MM.YYYY')}{' '}
      <span className="text-muted-foreground">{value.format('HH:mm')}</span>
    </time>
  );
}

interface ReservationsTableProps {
  data: Reservation[];
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
  /** The reservation open in the details drawer, marked as the selected row. */
  selectedReservationId?: number;
  onReservationOpen?: (reservationId: number) => void;
}

export default function ReservationsTable({
  data,
  isLoading = false,
  pageIndex = 0,
  pageSize = 20,
  totalCount = 0,
  pageCount = 0,
  onPaginationChange,
  sorting: sortingProp,
  onSortingChange,
  selectedReservationId,
  onReservationOpen
}: ReservationsTableProps) {
  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex,
      pageSize
    }),
    [pageIndex, pageSize]
  );

  // Use backend response values directly - no manual calculations
  const [internalSorting, setInternalSorting] = useState<SortingState>([
    { id: 'received_at', desc: true }
  ]);
  const sorting = sortingProp ?? internalSorting;
  const { t } = useLingui();

  const columns = useMemo<ColumnDef<DataGridFeatures, Reservation>[]>(
    () => [
      {
        accessorKey: 'state',
        id: 'state',

        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Status`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const status = row.getValue('state') as Reservation['state'];
          return <StatusCell status={status} />;
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-16" />,
          headerTitle: t`Status`
        },
        maxSize: 100,
        enableSorting: true,
        enableHiding: true,
        enableResizing: false
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
        cell: ({ row }) => {
          const reservationNr = row.getValue('booking_nr') as string;
          return (
            // The keyboard way into the details; a mouse click anywhere on
            // the row bubbles to the same handler
            <button
              type="button"
              className="rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ReservationNrCell reservationNr={reservationNr} />
            </button>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-12" />,
          headerTitle: t`Reservation`
        },
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'guests',
        id: 'guests',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Guests`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => <GuestsCell guests={row.original.guests} />,
        meta: {
          skeleton: <Skeleton className="h-6 w-32" />,
          headerTitle: t`Guests`
        },
        size: 180,
        enableSorting: false,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'room_name',
        id: 'room_name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Room`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => (
          <span className="block truncate" title={row.original.room_name}>
            {row.original.room_name}
          </span>
        ),
        meta: {
          skeleton: <Skeleton className="h-6 w-16" />,
          headerTitle: t`Room`
        },
        size: 132,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },

      {
        accessorKey: 'booking_from',
        id: 'booking_from',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Arrival`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => <StayDateCell date={row.original.booking_from} />,
        meta: {
          skeleton: <Skeleton className="h-6 w-24" />,
          headerTitle: t`Arrival`
        },
        size: 136,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'booking_to',
        id: 'booking_to',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Departure`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => <StayDateCell date={row.original.booking_to} />,
        meta: {
          skeleton: <Skeleton className="h-6 w-24" />,
          headerTitle: t`Departure`
        },
        size: 136,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'balance',
        id: 'balance',
        header: ({ column }) => (
          <div className="flex justify-end">
            <DataGridColumnHeader
              title={t`Balance`}
              visibility={true}
              column={column}
            />
          </div>
        ),
        cell: ({ row }) => {
          return <BalanceCell value={row.original.balance} currency="EUR" />;
        },
        meta: {
          skeleton: (
            <div className="flex items-center justify-end">
              <Skeleton className="h-6 w-16" />
            </div>
          ),
          headerTitle: t`Balance`
        },
        size: 100,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },

      {
        accessorKey: 'actions',
        id: 'actions',
        header: () => null,
        cell: ({ row }) => {
          return (
            // The menu and its dialog keep their clicks from opening the row
            <div
              className="flex justify-center"
              onClick={(event) => event.stopPropagation()}
            >
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
        size: 56,
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

  const rowSelection = useMemo<RowSelectionState>(
    () =>
      selectedReservationId === undefined
        ? {}
        : { [selectedReservationId]: true },
    [selectedReservationId]
  );

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: data || [],
    pageCount: pageCount, // Calculate from backend values
    getRowId: (row: Reservation) => row.id.toString(),
    state: {
      pagination,
      sorting,
      columnOrder,
      rowSelection
    },
    // Selection only marks the reservation open in the details drawer
    enableRowSelection: true,
    onPaginationChange: onPaginationChange,
    onSortingChange: onSortingChange ?? setInternalSorting,
    onColumnOrderChange: setColumnOrder,
    manualPagination: true, // Enable manual pagination for server-side
    manualSorting: true, // Enable manual sorting for server-side
    enableSortingRemoval: false
  });

  return (
    <DataGrid
      table={table}
      recordCount={totalCount}
      onRowClick={(reservation) => onReservationOpen?.(reservation.id)}
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
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
