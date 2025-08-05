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
import { ChevronDownIcon, ChevronUpIcon, CopyIcon } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
                    <FormattedMessage
                      id="reservations.details.title"
                      defaultMessage="Reservation details"
                    />
                  </h2>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" appearance="light">
                      {row.booking_nr}
                    </Badge>
                    <Button mode="icon" variant="ghost" size="sm">
                      <CopyIcon />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid max-w-6xl grid-cols-3 justify-items-stretch gap-x-12 gap-y-3">
                {/* Column 1 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <FormattedMessage
                        id="reservations.details.reservationId"
                        defaultMessage="Reservation ID"
                      />
                    </span>
                    <span className="text-sm">{row.id}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <FormattedMessage
                        id="reservations.details.guestEmail"
                        defaultMessage="Guest Email"
                      />
                    </span>
                    <span className="text-sm">{row.guest_email}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <FormattedMessage
                        id="reservations.details.room"
                        defaultMessage="Room"
                      />
                    </span>
                    <span className="text-sm">{row.room_name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <FormattedMessage
                        id="reservations.details.primaryGuest"
                        defaultMessage="Primary Guest"
                      />
                    </span>
                    <span className="text-sm">{row.primary_guest_name}</span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <FormattedMessage
                        id="reservations.details.arrivalDate"
                        defaultMessage="Arrival Date"
                      />
                    </span>
                    <span className="text-sm">
                      {dayjs(row.booking_from).format('DD.MM.YYYY')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <FormattedMessage
                        id="reservations.details.departureDate"
                        defaultMessage="Departure Date"
                      />
                    </span>
                    <span className="text-sm">
                      {dayjs(row.booking_to).format('DD.MM.YYYY')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <FormattedMessage
                        id="reservations.details.checkInVia"
                        defaultMessage="Check-in via"
                      />
                    </span>
                    <span className="text-sm">
                      {(() => {
                        const getDisplayText = (value: CheckInCheckOutVia) => {
                          switch (value) {
                            case 'android':
                              return intl.formatMessage({
                                id: 'reservations.checkInVia.android',
                                defaultMessage: 'Android App'
                              });
                            case 'ios':
                              return intl.formatMessage({
                                id: 'reservations.checkInVia.ios',
                                defaultMessage: 'iOS App'
                              });
                            case 'tv':
                              return intl.formatMessage({
                                id: 'reservations.checkInVia.tv',
                                defaultMessage: 'TV App'
                              });
                            case 'station':
                              return intl.formatMessage({
                                id: 'reservations.checkInVia.station',
                                defaultMessage: 'Station'
                              });
                            case 'web':
                              return intl.formatMessage({
                                id: 'reservations.checkInVia.web',
                                defaultMessage: 'Web App'
                              });
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
                      <FormattedMessage
                        id="reservations.details.checkOutVia"
                        defaultMessage="Check-out via"
                      />
                    </span>
                    <span className="text-sm">
                      {(() => {
                        const getDisplayText = (value: CheckInCheckOutVia) => {
                          switch (value) {
                            case 'android':
                              return intl.formatMessage({
                                id: 'reservations.checkInVia.android',
                                defaultMessage: 'Android App'
                              });
                            case 'ios':
                              return intl.formatMessage({
                                id: 'reservations.checkInVia.ios',
                                defaultMessage: 'iOS App'
                              });
                            case 'tv':
                              return intl.formatMessage({
                                id: 'reservations.checkInVia.tv',
                                defaultMessage: 'TV App'
                              });
                            case 'station':
                              return intl.formatMessage({
                                id: 'reservations.checkInVia.station',
                                defaultMessage: 'Station'
                              });
                            case 'web':
                              return intl.formatMessage({
                                id: 'reservations.checkInVia.web',
                                defaultMessage: 'Web App'
                              });
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
                      <FormattedMessage
                        id="reservations.details.balance"
                        defaultMessage="Balance"
                      />
                    </span>
                    <span className="text-sm">
                      <CurrencyFormatter value={row.balance} currency="EUR" />
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <FormattedMessage
                        id="reservations.details.receivedAt"
                        defaultMessage="Received At"
                      />
                    </span>
                    <span className="text-sm">
                      {dayjs(row.received_at).format('DD.MM.YYYY')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      <FormattedMessage
                        id="reservations.details.completedAt"
                        defaultMessage="Completed At"
                      />
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
              id: 'reservations.bookingNumber',
              defaultMessage: 'Booking #'
            })}
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
            title={intl.formatMessage({
              id: 'reservations.guests',
              defaultMessage: 'Guests'
            })}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="space-y-1">
              {row.original.guests.map((guest) => {
                return (
                  <div key={guest.id} className="text-nowrap">
                    <FormattedMessage
                      id="reservations.guestNameFormat"
                      defaultMessage="{lastName}, {firstName}"
                      values={{
                        lastName: guest.last_name,
                        firstName: guest.first_name
                      }}
                    />
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
            title={intl.formatMessage({
              id: 'reservations.departure',
              defaultMessage: 'Departure'
            })}
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
            title={intl.formatMessage({
              id: 'reservations.balance',
              defaultMessage: 'Balance'
            })}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <CurrencyFormatter
              value={row.original.balance}
              currency="EUR"
              className="text-right"
            />
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
