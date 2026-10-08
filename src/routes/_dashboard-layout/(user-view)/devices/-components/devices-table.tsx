import { Trans, useLingui } from '@lingui/react/macro';
import { type ColumnDef, useTable } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { type ReactNode, useMemo } from 'react';
import type { Device } from 'shared/types/devices';

import {
  DataGrid,
  DataGridContainer,
  type DataGridFeatures,
  dataGridFeatures
} from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

import { connectionStatus, formatRelativeTime } from '../-lib/devices';
import { ConnectionStatusDot, ConnectionStatusName } from './connection-status';
import { RoomCell } from './room-cell';

const noDevices: Device[] = [];

interface DevicesTableProps {
  data?: Device[];
  isLoading?: boolean;
  /** The moment the connection statuses are computed for. */
  now?: number;
  /** A device to tint for a moment, e.g. the one just added. */
  highlightedId?: number;
  emptyMessage?: ReactNode;
}

function LastSignalCell({ device, now }: { device: Device; now: number }) {
  const { i18n } = useLingui();
  const status = connectionStatus(device.last_seen_at, now);
  const lastSeen = device.last_seen_at;

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
        {lastSeen ? (
          <time dateTime={lastSeen}>
            {formatRelativeTime(lastSeen, i18n.locale, now)}
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
            {dayjs(lastSeen).format('DD.MM.YYYY HH:mm:ss')}
          </span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function DevicesTable({
  data = noDevices,
  isLoading = false,
  now = 0,
  highlightedId,
  emptyMessage
}: DevicesTableProps) {
  const { t } = useLingui();

  const columns = useMemo<ColumnDef<DataGridFeatures, Device>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader title={t`Name`} column={column} />
        ),
        cell: ({ row }) => (
          // The row reads this marker to tint itself, see `bodyRow` below
          <span
            data-highlighted={row.original.id === highlightedId || undefined}
          >
            {row.original.name || (
              <span className="text-muted-foreground">
                <Trans>Unnamed device</Trans>
              </span>
            )}
          </span>
        ),
        meta: { skeleton: <Skeleton className="h-4 w-32" /> },
        size: 220,
        enableSorting: false
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
        enableSorting: false
      },
      {
        id: 'room',
        header: ({ column }) => (
          <DataGridColumnHeader title={t`Room`} column={column} />
        ),
        cell: ({ row }) => <RoomCell device={row.original} />,
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
        enableSorting: false
      },
      {
        accessorKey: 'last_seen_at',
        id: 'last_seen_at',
        header: ({ column }) => (
          <DataGridColumnHeader title={t`Last signal`} column={column} />
        ),
        cell: ({ row }) => <LastSignalCell device={row.original} now={now} />,
        meta: { skeleton: <Skeleton className="h-4 w-24" /> },
        size: 170,
        enableSorting: false
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
        enableSorting: false
      }
    ],
    [t, now, highlightedId]
  );

  // The rows arrive filtered and ordered; the list is not paginated.
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data,
    getRowId: (device: Device) => device.id.toString()
  });

  return (
    <DataGrid
      table={table}
      recordCount={data.length}
      isLoading={isLoading}
      skeletonRowCount={8}
      emptyMessage={emptyMessage}
      tableClassNames={{
        edgeCell: 'px-5',
        bodyRow:
          'transition-colors duration-700 has-data-highlighted:bg-emerald-500/15 has-data-highlighted:hover:bg-emerald-500/15'
      }}
    >
      <DataGridContainer>
        <ScrollArea>
          <DataGridTable />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DataGridContainer>
    </DataGrid>
  );
}
