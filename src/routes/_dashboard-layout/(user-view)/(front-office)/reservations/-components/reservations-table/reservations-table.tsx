import { useMemo, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
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
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import Flag from 'react-flagkit';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code } from '@/components/ui/code';
import { CurrencyFormatter } from '@/components/ui/currency-formatter';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import { RowActions } from './row-actions';

type Guest = {
  id: string;
  first_name: string;
  last_name: string;
  nationality_code: 'DE' | 'US';
};

type CheckInCheckOutVia = 'android' | 'ios' | 'tv' | 'station' | 'web';

export type Reservation = {
  id: number;
  state: 'pending' | 'started' | 'done';
  booking_nr: string;
  guest_email: string;
  guests: Guest[];
  booking_id: string;
  room_name: string;
  booking_from: string;
  booking_to: string;
  check_in_via: CheckInCheckOutVia;
  check_out_via: CheckInCheckOutVia;
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
  totalCount?: number;
  pageCount?: number;
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
  totalCount = 0,
  pageCount = 0,
  onPaginationChange
}: ReservationsTableProps) {
  const pagination: PaginationState = {
    pageIndex,
    pageSize
  };

  // Use backend response values directly - no manual calculations
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'received_at', desc: true }
  ]);
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
            >
              {row.getIsExpanded() ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          ) : null;
        },
        size: 12,
        meta: {
          skeleton: <Skeleton className="h-6 w-6 rounded" />,
          expandedContent: (row) => (
            <div className="space-y-4 px-6 py-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-medium">
                    <Trans>Reservation details</Trans>
                  </h2>
                  <div className="flex items-center gap-1">
                    <Code size="sm" showCopyButton copyText={row.booking_nr}>
                      {row.booking_nr}
                    </Code>
                  </div>
                </div>
              </div>

              <div className="grid max-w-6xl grid-cols-3 justify-items-stretch gap-x-12 gap-y-3">
                {/* Column 1 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <Trans>Reservation ID</Trans>
                    </span>
                    <span className="text-sm">{row.id}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <Trans>Guest Email</Trans>
                    </span>
                    <span className="text-sm">{row.guest_email}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <Trans>Room</Trans>
                    </span>
                    <span className="text-sm">{row.room_name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <Trans>Primary Guest</Trans>
                    </span>
                    <span className="text-sm">{row.primary_guest_name}</span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <Trans>Arrival Date</Trans>
                    </span>
                    <span className="text-sm">
                      {dayjs(row.booking_from).format('DD.MM.YYYY')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <Trans>Departure Date</Trans>
                    </span>
                    <span className="text-sm">
                      {dayjs(row.booking_to).format('DD.MM.YYYY')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <Trans>Check-in via</Trans>
                    </span>
                    <span className="text-sm">
                      {(() => {
                        const getDisplayText = (value: CheckInCheckOutVia) => {
                          switch (value) {
                            case 'android':
                              return <Trans>Android App</Trans>;
                            case 'ios':
                              return <Trans>iOS App</Trans>;
                            case 'tv':
                              return <Trans>TV App</Trans>;
                            case 'station':
                              return <Trans>Station</Trans>;
                            case 'web':
                              return <Trans>Web App</Trans>;
                            default:
                              return value;
                          }
                        };
                        return getDisplayText(row.check_in_via);
                      })()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <Trans>Check-out via</Trans>
                    </span>
                    <span className="text-sm">
                      {(() => {
                        const getDisplayText = (value: CheckInCheckOutVia) => {
                          switch (value) {
                            case 'android':
                              return <Trans>Android App</Trans>;
                            case 'ios':
                              return <Trans>iOS App</Trans>;
                            case 'tv':
                              return <Trans>TV App</Trans>;
                            case 'station':
                              return <Trans>Station</Trans>;
                            case 'web':
                              return <Trans>Web App</Trans>;
                            default:
                              return value;
                          }
                        };
                        return getDisplayText(row.check_out_via);
                      })()}
                    </span>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <Trans>Balance</Trans>
                    </span>
                    <span className="text-sm">
                      <CurrencyFormatter value={row.balance} currency="EUR" />
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <Trans>Received At</Trans>
                    </span>
                    <span className="text-sm">
                      {dayjs(row.received_at).format('DD.MM.YYYY')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <Trans>Completed At</Trans>
                    </span>
                    <span className="text-sm">
                      {dayjs(row.completed_at).format('DD.MM.YYYY')}
                    </span>
                  </div>
                </div>
              </div>
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
                return t`Done`;
              case 'pending':
                return t`Pending`;
              case 'started':
                return t`Started`;
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
            title={t`Booking #`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const bookingNr = row.getValue('booking_nr') as string;
          const displayText =
            bookingNr.length > 5
              ? `${bookingNr.substring(0, 5)}...`
              : bookingNr;

          return (
            <span className="font-medium" title={bookingNr}>
              {displayText}
            </span>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-12" />,
          cellClassName: 'max-w-[150px] truncate'
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
          skeleton: <Skeleton className="h-6 w-16" />
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
          return (
            <div className="space-y-0.5">
              {row.original.guests.map((guest) => {
                const firstName = guest.first_name;
                const lastName = guest.last_name;

                return (
                  <div
                    key={guest.id}
                    className="flex items-center gap-2 text-nowrap"
                  >
                    <Flag
                      country={guest.nationality_code}
                      title={guest.nationality_code}
                      className="size-3.5 rounded-sm"
                      aria-label={guest.nationality_code}
                    />
                    <Trans>
                      {lastName}, {firstName}
                    </Trans>
                  </div>
                );
              })}
            </div>
          );
        },
        meta: {
          skeleton: (
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          )
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
          return dayjs(row.original.booking_from).format('DD.MM.YYYY');
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-24" />
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
          return dayjs(row.original.booking_to).format('DD.MM.YYYY');
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-24" />
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
          return (
            <div className="text-right">
              <CurrencyFormatter value={row.original.balance} currency="EUR" />
            </div>
          );
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
