import { useMemo, useState } from 'react';

import type { Reservation } from '@/api/reservations';
import { useLingui } from '@lingui/react/macro';
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import { BalanceCell } from './-components/cells/balance-cell';
import { BookingNrCell } from './-components/cells/booking-nr-cell';
import { DateCell } from './-components/cells/date-cell';
import { GuestsCell } from './-components/cells/guests-cell';
import { StatusCell } from './-components/cells/status-cell';
import { ReservationDetails } from './-components/reservation-details';
import { RowActions } from './row-actions';

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
                className: 'size-6 text-muted-foreground',
                onClick: row.getToggleExpandedHandler(),
                mode: 'icon',
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
        size: 100,
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
          const bookingNr = row.getValue('booking_nr') as string;
          return <BookingNrCell bookingNr={bookingNr} />;
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-12" />,
          cellClassName: 'max-w-[150px] truncate',
          headerTitle: t`Booking #`
        },
        size: 100,
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
        size: 100,
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
        cell: ({ row }) => {
          return <GuestsCell guests={row.original.guests} />;
        },
        meta: {
          skeleton: (
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ),
          headerTitle: t`Guests`
        },
        size: 180,
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
          return <DateCell isoDate={row.original.booking_from.toISOString()} />;
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-24" />,
          headerTitle: t`Arrival`
        },
        size: 120,
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
          return <DateCell isoDate={row.original.booking_to.toISOString()} />;
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-24" />,
          headerTitle: t`Departure`
        },
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'balance',
        id: 'balance',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Balance`}
            visibility={true}
            column={column}
          />
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
    manualSorting: true // Enable manual sorting for server-side
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
