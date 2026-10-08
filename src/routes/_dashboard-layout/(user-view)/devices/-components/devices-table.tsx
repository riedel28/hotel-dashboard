import { Trans, useLingui } from '@lingui/react/macro';
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  useTable
} from '@tanstack/react-table';
import { type ReactNode, useMemo } from 'react';

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { formatDate } from '@/utils/date';

import {
  DEVICE_PAGE_SIZES,
  type DeviceView,
  formatRelativeTime
} from '../-lib/devices';
import { ConnectionStatusDot, ConnectionStatusName } from './connection-status';
import { DeviceRoomControl } from './device-room-control';

const noDevices: DeviceView[] = [];
const noSorting: SortingState = [];
// The loading table shows this many placeholder rows
const skeletonPagination: PaginationState = { pageIndex: 0, pageSize: 10 };
const ignore = () => {};

interface DevicesTableProps {
  /** The rows of the current page, already filtered and ordered. */
  devices: DeviceView[];
  /** How many devices there are across all pages. */
  totalCount: number;
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  isLoading?: boolean;
  /** A device to tint and scroll to for a moment, e.g. the one just added. */
  highlightedId?: number;
  emptyMessage?: ReactNode;
  onDeviceOpen?: (device: DeviceView) => void;
}

function LastSignalCell({ device }: { device: DeviceView }) {
  const { i18n } = useLingui();
  const { status, signalAgeMs, last_seen_at: lastSeen } = device;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-flex items-center gap-2" tabIndex={0} />
        }
      >
        <ConnectionStatusDot status={status} />
        <span className="sr-only">
          <ConnectionStatusName status={status} />,
        </span>
        {lastSeen && signalAgeMs !== null ? (
          <time dateTime={lastSeen}>
            {formatRelativeTime(signalAgeMs, i18n.locale)}
          </time>
        ) : (
          <span className="text-muted-foreground">
            <Trans>Never</Trans>
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent>
        <ConnectionStatusName status={status} />
        {lastSeen && (
          <span className="tabular-nums">
            {' · '}
            {formatDate(lastSeen, { preset: 'dateTimeWithSeconds' })}
          </span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

// A ref for the highlighted row: runs when that row appears, whether it was
// already listed or only shows up once filters stop hiding it. The row can be
// anywhere in a long list, so it is brought on screen.
const scrollIntoView = (row: HTMLTableRowElement | null) =>
  row?.scrollIntoView({ block: 'center', behavior: 'smooth' });

/** The table's shape while the devices load. */
export function DevicesTableSkeleton() {
  return (
    <DevicesTable
      devices={noDevices}
      totalCount={0}
      pageCount={0}
      pagination={skeletonPagination}
      onPaginationChange={ignore}
      sorting={noSorting}
      onSortingChange={ignore}
      isLoading
    />
  );
}

export function DevicesTable({
  devices,
  totalCount,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  isLoading = false,
  highlightedId,
  emptyMessage,
  onDeviceOpen
}: DevicesTableProps) {
  const { t } = useLingui();
  const columns = useMemo<ColumnDef<DataGridFeatures, DeviceView>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader title={t`Name`} column={column} />
        ),
        cell: ({ row }) => (
          // The click bubbles to the row, which opens the details; the button
          // is what makes that reachable from the keyboard
          <button
            type="button"
            className="cursor-pointer rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {row.original.name || (
              <span className="text-muted-foreground">
                <Trans>Unnamed device</Trans>
              </span>
            )}
          </button>
        ),
        meta: { skeleton: <Skeleton className="h-4 w-32" /> },
        size: 220,
        enableSorting: true
      },
      {
        accessorKey: 'serial_number',
        id: 'serial_number',
        header: ({ column }) => (
          <DataGridColumnHeader title={t`Serial number`} column={column} />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-[13px]">
            {row.original.serial_number}
          </span>
        ),
        meta: { skeleton: <Skeleton className="h-4 w-28" /> },
        size: 180,
        enableSorting: true
      },
      {
        // An accessor is what makes the column sortable
        accessorKey: 'room',
        id: 'room',
        header: ({ column }) => (
          <DataGridColumnHeader title={t`Room`} column={column} />
        ),
        cell: ({ row }) => (
          // Picking a room is not a click on the row. React events bubble
          // through portals, so this also covers the picker's popup.
          // oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
          <div
            // Only as wide as the button: the rest of the cell is still the
            // row
            className="w-fit"
            onClick={(event) => event.stopPropagation()}
          >
            <DeviceRoomControl device={row.original} />
          </div>
        ),
        meta: {
          // As tall as the room button, so rows keep their height once the
          // devices load
          skeleton: (
            <div className="flex h-7 items-center">
              <Skeleton className="h-4 w-16" />
            </div>
          )
        },
        size: 150,
        enableSorting: true
      },
      {
        accessorKey: 'last_seen_at',
        id: 'last_seen_at',
        header: ({ column }) => (
          <DataGridColumnHeader title={t`Last signal`} column={column} />
        ),
        cell: ({ row }) => <LastSignalCell device={row.original} />,
        meta: { skeleton: <Skeleton className="h-4 w-24" /> },
        size: 170,
        enableSorting: true
      },
      {
        accessorKey: 'app_version',
        id: 'app_version',
        header: ({ column }) => (
          <DataGridColumnHeader title={t`App version`} column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {row.original.app_version || '-'}
          </span>
        ),
        meta: { skeleton: <Skeleton className="h-4 w-12" /> },
        size: 120,
        enableSorting: true
      }
    ],
    [t]
  );

  // The whole list is in memory, so the page computes the rows of one page
  // itself; the table only shows them and reports what the user asks for.
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: devices,
    pageCount,
    getRowId: (device: DeviceView) => device.id.toString(),
    state: { pagination, sorting },
    onPaginationChange,
    onSortingChange,
    manualPagination: true,
    manualSorting: true
  });

  return (
    <DataGrid
      table={table}
      recordCount={totalCount}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      onRowClick={onDeviceOpen}
      getRowProps={(device) =>
        device.id === highlightedId
          ? {
              ref: scrollIntoView,
              className: 'bg-emerald-500/15 hover:bg-emerald-500/15'
            }
          : undefined
      }
      tableClassNames={{
        edgeCell: 'px-5',
        // The highlight fades in and out
        bodyRow: 'transition-colors duration-700'
      }}
    >
      <div className="w-full space-y-2.5">
        <DataGridContainer>
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
        <DataGridPagination sizes={DEVICE_PAGE_SIZES} />
      </div>
    </DataGrid>
  );
}
