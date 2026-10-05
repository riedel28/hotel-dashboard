import { useLingui } from '@lingui/react/macro';
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { Reservation } from '@/api/reservations';
import { Button } from '@/components/ui/button';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/utils/date';

import { BalanceCell } from './-components/cells/balance-cell';
import { ReservationNrCell } from './-components/cells/reservation-nr-cell';
import { StatusCell } from './-components/cells/status-cell';
import { ReservationDetails } from './-components/reservation-details';
import { RowActions } from './row-actions';

const formatReservationDate = (date: Date | string) =>
  dayjs(date).format('DD.MM.YYYY HH:mm');

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
  onSortingChange
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

  const columns = useMemo<ColumnDef<Reservation>[]>(
    () => [
      {
        id: 'id',
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <Button
              {...{
                className: 'size-7 text-muted-foreground',
                onClick: row.getToggleExpandedHandler(),
                size: 'icon',
                variant: 'ghost'
              }}
              aria-expanded={row.getIsExpanded()}
              aria-controls={`reservation-details-${row.id}`}
              aria-label={t`Toggle details`}
              title={t`Toggle details`}
            >
              {row.getIsExpanded() ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          ) : null;
        },
        size: 12,
        meta: {
          skeleton: <Skeleton className="h-6 w-6 rounded" />,
          expandedContent: (row) => (
            <div id={`reservation-details-${row.id}`}>
              <ReservationDetails reservation={row} />
            </div>
          )
        }
      },
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
            title={t`Booking #`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const reservationNr = row.getValue('booking_nr') as string;
          return <ReservationNrCell reservationNr={reservationNr} />;
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-12" />,
          headerTitle: t`Booking #`
        },
        enableSorting: true,
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
        cell: (info) => <span>{info.getValue() as string}</span>,
        meta: {
          skeleton: <Skeleton className="h-6 w-16" />,
          headerTitle: t`Room`
        },
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
        cell: ({ row }) => {
          return (
            <span className="text-[13px]">
              {formatDate(row.original.booking_from, { preset: 'dateTime' })}
            </span>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-24" />,
          headerTitle: t`Arrival`
        },
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
        cell: ({ row }) => {
          return (
            <span className="text-[13px]">
              {formatReservationDate(row.original.booking_to)}
            </span>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-24" />,
          headerTitle: t`Departure`
        },
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
    pageCount: pageCount, // Calculate from backend values
    getRowId: (row: Reservation) => row.id.toString(),
    getRowCanExpand: (row) => Boolean(row.original.id),
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
    manualPagination: true, // Enable manual pagination for server-side
    manualSorting: true, // Enable manual sorting for server-side
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
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
