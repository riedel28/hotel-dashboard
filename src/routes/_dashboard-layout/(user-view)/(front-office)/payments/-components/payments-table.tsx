import { useLingui } from '@lingui/react/macro';
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useTable
} from '@tanstack/react-table';
import { type ReactNode, useMemo } from 'react';
import { latestStage, type Payment } from 'shared/types/payments';

import { ReservationLink } from '@/components/reservation-link';
import { CurrencyFormatter } from '@/components/ui/currency-formatter';
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
import { formatDate } from '@/utils/date';

import {
  CardSummary,
  PaymentStatusBadge,
  PaymentTypeLabel,
  ReferenceValue
} from './payment-fields';

interface PaymentsTableProps {
  data: Payment[];
  isLoading: boolean;
  totalCount: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  /** The payment open in the details drawer, marked as the selected row. */
  selectedPaymentId: number | undefined;
  onPaymentOpen: (paymentId: number) => void;
  emptyMessage: ReactNode;
  /** A failed load (`LoadErrorState`), shown where the rows go. */
  error?: ReactNode;
}

export function PaymentsTable({
  data,
  isLoading,
  totalCount,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  selectedPaymentId,
  onPaymentOpen,
  emptyMessage,
  error
}: PaymentsTableProps) {
  const { t } = useLingui();

  // Each column is as wide as its widest content; together they fit a
  // 1280px laptop (965px), and wider screens share out the rest
  const columns = useMemo<ColumnDef<DataGridFeatures, Payment>[]>(
    () => [
      {
        id: 'reservation',
        header: ({ column }) => (
          <DataGridColumnHeader title={t`Reservation`} column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col">
            <span className="truncate py-0.5">
              <ReservationLink
                reservationId={row.original.reservation_id}
                bookingNr={row.original.booking_nr}
                onClick={(event) => event.stopPropagation()}
              />
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {row.original.room_name ?? '—'}
            </span>
          </div>
        ),
        meta: {
          skeleton: <Skeleton className="h-9 w-24" />,
          headerTitle: t`Reservation`
        },
        size: 140,
        enableSorting: false
      },
      {
        id: 'type',
        header: ({ column }) => (
          <DataGridColumnHeader title={t`Type`} column={column} />
        ),
        cell: ({ row }) => (
          // The keyboard way into the payment; a mouse click anywhere on the
          // row bubbles to the same handler
          <button
            type="button"
            className="block max-w-full truncate rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PaymentTypeLabel type={row.original.type} />
          </button>
        ),
        meta: {
          skeleton: <Skeleton className="h-5 w-20" />,
          headerTitle: t`Type`
        },
        size: 120,
        enableSorting: false
      },
      {
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader title={t`Status`} column={column} />
        ),
        cell: ({ row }) => <PaymentStatusBadge payment={row.original} />,
        meta: {
          skeleton: <Skeleton className="h-5 w-20" />,
          headerTitle: t`Status`
        },
        size: 110,
        enableSorting: false
      },
      {
        id: 'amount',
        header: ({ column }) => (
          // Right-aligned like the amounts, as the reservations' balance
          <div className="flex justify-end">
            <DataGridColumnHeader title={t`Amount`} column={column} />
          </div>
        ),
        cell: ({ row }) => (
          <CurrencyFormatter
            value={latestStage(row.original).amount}
            currency={row.original.currency}
            className="block text-right"
          />
        ),
        meta: {
          skeleton: <Skeleton className="ml-auto h-5 w-20" />,
          headerTitle: t`Amount`
        },
        size: 120,
        enableSorting: true
      },
      {
        id: 'updated_at',
        header: ({ column }) => (
          <DataGridColumnHeader title={t`Updated`} column={column} />
        ),
        cell: ({ row }) => {
          const { at } = latestStage(row.original);
          return (
            <time
              dateTime={at.toISOString()}
              className="text-[13px] whitespace-nowrap text-muted-foreground tabular-nums"
            >
              {formatDate(at, { preset: 'dateTime' })}
            </time>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-5 w-28" />,
          headerTitle: t`Updated`
        },
        size: 145,
        enableSorting: true
      },
      {
        id: 'reference',
        header: ({ column }) => (
          <DataGridColumnHeader title={t`Reference`} column={column} />
        ),
        cell: ({ row }) => (
          <ReferenceValue reference={row.original.reference} />
        ),
        meta: {
          skeleton: <Skeleton className="h-5 w-32" />,
          headerTitle: t`Reference`
        },
        size: 170,
        enableSorting: false
      },
      {
        id: 'card',
        header: ({ column }) => (
          <DataGridColumnHeader title={t`Card`} column={column} />
        ),
        cell: ({ row }) => <CardSummary payment={row.original} />,
        meta: {
          skeleton: <Skeleton className="h-5 w-24" />,
          headerTitle: t`Card`
        },
        size: 160,
        enableSorting: false
      }
    ],
    [t]
  );

  const rowSelection = useMemo<RowSelectionState>(
    () =>
      selectedPaymentId === undefined ? {} : { [selectedPaymentId]: true },
    [selectedPaymentId]
  );

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data,
    pageCount,
    getRowId: (row: Payment) => row.id.toString(),
    state: {
      pagination,
      sorting,
      rowSelection
    },
    // Selection only marks the payment open in the details panel
    enableRowSelection: true,
    onPaginationChange,
    onSortingChange,
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false
  });

  return (
    <DataGrid
      error={error}
      table={table}
      recordCount={totalCount}
      onRowClick={(payment) => onPaymentOpen(payment.id)}
      tableClassNames={{ edgeCell: 'px-5' }}
      emptyMessage={emptyMessage}
      tableLayout={{
        columnsPinnable: false,
        columnsMovable: false,
        columnsVisibility: false
      }}
      isLoading={isLoading}
      skeletonRowCount={5}
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
