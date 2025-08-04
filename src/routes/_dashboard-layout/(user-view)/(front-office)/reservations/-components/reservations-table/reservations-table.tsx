import { useMemo, useState } from 'react';

import {
  ColumnDef,
  PaginationState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useIntl } from 'react-intl';

import { Badge } from '@/components/ui/badge';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import { RowActions } from './row-actions';

export type Reservation = {
  id: number;
  state: 'pending' | 'started' | 'done';
  booking_nr: string;
  guest_email: string;
  booking_id: string;
  room_name: string;
  booking_from: string;
  primary_guest_name: string;
  last_opened_at: string;
  received_at: string;
  completed_at: string;
  page_url: string;
  balance: number;
};

interface ReservationsTableProps {
  data: Reservation[];
  isLoading?: boolean;
  pageIndex?: number;
  pageSize?: number;
  onPaginationChange?: (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) => void;
}

export default function ReservationsTable({
  data,
  isLoading = false,
  pageIndex = 0,
  pageSize = 20,
  onPaginationChange
}: ReservationsTableProps) {
  const pagination: PaginationState = {
    pageIndex,
    pageSize
  };
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'received_at', desc: true }
  ]);
  const intl = useIntl();

  const columns = useMemo<ColumnDef<Reservation>[]>(
    () => [
      {
        accessorKey: 'state',
        id: 'state',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={intl.formatMessage({
              id: 'reservations.status',
              defaultMessage: 'Status'
            })}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const status = row.getValue('state') as Reservation['state'];

          const getStatusVariant = () => {
            switch (status) {
              case 'done':
                return 'success';
              case 'pending':
                return 'warning';
              case 'started':
                return 'info';
              default:
                return 'secondary';
            }
          };

          const getStatusMessage = () => {
            switch (status) {
              case 'done':
                return intl.formatMessage({
                  id: 'reservations.status.done',
                  defaultMessage: 'Done'
                });
              case 'pending':
                return intl.formatMessage({
                  id: 'reservations.status.pending',
                  defaultMessage: 'Pending'
                });
              case 'started':
                return intl.formatMessage({
                  id: 'reservations.status.started',
                  defaultMessage: 'Started'
                });
              default:
                return status;
            }
          };

          return (
            <Badge size="md" variant={getStatusVariant()} appearance="light">
              {getStatusMessage()}
            </Badge>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-16" />
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
            title={intl.formatMessage({
              id: 'reservations.reservationNr',
              defaultMessage: 'Reservation Nr.'
            })}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const bookingNr = row.getValue('booking_nr') as string;
          const displayText =
            bookingNr.length > 15
              ? `${bookingNr.substring(0, 15)}...`
              : bookingNr;

          return (
            <span className="font-medium" title={bookingNr}>
              {displayText}
            </span>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-full" />,
          cellClassName: 'max-w-[150px] truncate'
        },
        size: 150,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'room_name',
        id: 'room_name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={intl.formatMessage({
              id: 'reservations.room',
              defaultMessage: 'Room'
            })}
            visibility={true}
            column={column}
          />
        ),
        cell: (info) => <span>{info.getValue() as string}</span>,
        meta: {
          skeleton: <Skeleton className="h-6 w-20" />
        },
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'booking_from',
        id: 'booking_from',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={intl.formatMessage({
              id: 'reservations.arrival',
              defaultMessage: 'Arrival'
            })}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return dayjs(row.original.booking_from).format('DD.MM.YYYY');
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-20" />
        },
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'primary_guest_name',
        id: 'primary_guest_name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={intl.formatMessage({
              id: 'reservations.primaryGuest',
              defaultMessage: 'Primary guest'
            })}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const [firstName, lastName] =
            row.original.primary_guest_name.split(' ');
          return `${lastName}, ${firstName}`;
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-full" />
        },
        size: 130,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'balance',
        id: 'balance',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={intl.formatMessage({
              id: 'reservations.balance',
              defaultMessage: 'Balance'
            })}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const amount = new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: row.original.balance % 1 === 0 ? 0 : 2
          }).format(row.original.balance);

          return <div className="text-right">{amount}</div>;
        },
        meta: {
          skeleton: (
            <div className="flex items-center justify-end">
              <Skeleton className="h-6 w-16" />
            </div>
          )
        },
        size: 100,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'received_at',
        id: 'received_at',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={intl.formatMessage({
              id: 'reservations.receivedAt',
              defaultMessage: 'Received at'
            })}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return dayjs(row.original.received_at).format('DD.MM.YYYY');
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-20" />
        },
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'completed_at',
        id: 'completed_at',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={intl.formatMessage({
              id: 'reservations.completedAt',
              defaultMessage: 'Completed at'
            })}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return dayjs(row.original.completed_at).format('DD.MM.YYYY');
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-20" />
        },
        size: 120,
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
    [intl]
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const table = useReactTable({
    columns,
    data: data || [],
    pageCount: pageSize,
    getRowId: (row: Reservation) => row.id.toString(),
    state: {
      pagination,
      sorting,
      columnOrder
    },
    onPaginationChange: onPaginationChange,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <DataGrid
      table={table}
      recordCount={data?.length || 0}
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
