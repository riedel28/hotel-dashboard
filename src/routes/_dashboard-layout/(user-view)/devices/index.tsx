import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { PlusCircleIcon, TabletSmartphoneIcon, XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  type Device,
  deviceConnectionStatusSchema
} from 'shared/types/devices';
import { z } from 'zod';

import { QueryBoundary } from '@/components/query-boundary';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { CountBadge } from '@/components/ui/count-badge';
import { DataGridRadioFilter } from '@/components/ui/data-grid-radio-filter';
import { DataGridSegmentedFilter } from '@/components/ui/data-grid-segmented-filter';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { SearchInput } from '@/components/ui/search-input';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { lenientSearch } from '@/lib/search-params';

import { ClaimDeviceModal } from './-components/claim-device-modal';
import { ConnectionStatusLabel } from './-components/connection-status';
import { DeviceDetailsDrawer } from './-components/device-details-drawer';
import { DeviceRoomActionsProvider } from './-components/device-room-actions';
import {
  DevicesTable,
  DevicesTableSkeleton
} from './-components/devices-table';
import { useDevices } from './-hooks/use-devices';
import { useDevicesSearch } from './-hooks/use-devices-search';
import {
  DEFAULT_DEVICE_PAGE_SIZE,
  DEVICE_PAGE_SIZES,
  deviceSortColumnSchema,
  deviceTabSchema,
  filterDevices,
  paginate,
  sortDevices
} from './-lib/devices';

const devicesSearchSchema = z.object({
  tab: deviceTabSchema.optional(),
  // A room number typed into the URL by hand arrives as a number
  q: z.union([z.string(), z.number().transform(String)]).optional(),
  status: deviceConnectionStatusSchema.optional(),
  // The device whose details are open
  device: z.number().int().positive().optional(),
  page: z.number().int().positive().default(1),
  per_page: z
    .number()
    .refine((size) => DEVICE_PAGE_SIZES.includes(size))
    .default(DEFAULT_DEVICE_PAGE_SIZE),
  // Absent means the default order: unassigned devices first, then by room
  sort_by: deviceSortColumnSchema.optional(),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

// How long a device that was just added stays tinted in the table
const HIGHLIGHT_MS = 3000;

const statusOptions = deviceConnectionStatusSchema.options.map((value) => ({
  value,
  label: <ConnectionStatusLabel status={value} />
}));

function TabLabel({ label, count }: { label: React.ReactNode; count: number }) {
  return (
    <span className="flex items-center gap-1.5">
      {label}
      <CountBadge count={count} />
    </span>
  );
}

function DevicesPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Devices`);
  const { clearFilters } = useDevicesSearch();

  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number>();

  useEffect(() => {
    if (highlightedId === undefined) return;
    const timeout = setTimeout(() => setHighlightedId(undefined), HIGHLIGHT_MS);
    return () => clearTimeout(timeout);
  }, [highlightedId]);

  const handleClaimed = (device: Device) => {
    // Filters could hide the new device; show it
    clearFilters();
    setHighlightedId(device.id);
  };

  return (
    <div className="space-y-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Trans>Devices</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex justify-between">
        <h1 className="text-xl font-bold">
          <Trans>Devices</Trans>
        </h1>
        <Button onClick={() => setIsClaimOpen(true)}>
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          <Trans>Add device</Trans>
        </Button>
      </div>

      <QueryBoundary
        className="min-h-[60vh] items-center justify-center"
        message={<Trans>An error occurred while fetching devices</Trans>}
        fallback={
          // The table under an empty row as tall as the filters, so it does
          // not move when the devices arrive and the filters appear above it
          <div className="space-y-2.5">
            <div className="h-9" />
            <DevicesTableSkeleton />
          </div>
        }
      >
        <DevicesContent
          highlightedId={highlightedId}
          onAddDevice={() => setIsClaimOpen(true)}
        />
      </QueryBoundary>

      <ClaimDeviceModal
        open={isClaimOpen}
        onOpenChange={setIsClaimOpen}
        onClaimed={handleClaimed}
      />
    </div>
  );
}

interface DevicesContentProps {
  highlightedId: number | undefined;
  onAddDevice: () => void;
}

function DevicesContent({ highlightedId, onAddDevice }: DevicesContentProps) {
  const { t } = useLingui();
  const devices = useDevices();
  const search = useDevicesSearch();
  const { setFilters } = search;
  const { tab, q, status } = search.filters;

  const { sort, pagination } = search;

  const matching = useMemo(() => {
    const filtered = filterDevices(devices, { tab, q, status });
    return sort ? sortDevices(filtered, sort) : filtered;
    // `sort` is a new object on every render; its fields are what matter
  }, [devices, tab, q, status, sort?.by, sort?.order]);
  const page = paginate(matching, pagination.pageIndex, pagination.pageSize);

  // A device that was just added may sit on another page; go to it
  const highlightedIndex = matching.findIndex(
    (device) => device.id === highlightedId
  );
  const highlightedPageIndex =
    highlightedIndex === -1
      ? undefined
      : Math.floor(highlightedIndex / pagination.pageSize);
  const { onPaginationChange } = search;
  useEffect(() => {
    if (
      highlightedPageIndex !== undefined &&
      highlightedPageIndex !== page.pageIndex
    ) {
      onPaginationChange((current) => ({
        ...current,
        pageIndex: highlightedPageIndex
      }));
    }
    // Only when the highlight lands on a page, not on every page change
  }, [highlightedPageIndex]);

  if (devices.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TabletSmartphoneIcon />
          </EmptyMedia>
          <EmptyTitle>
            <Trans>No devices yet</Trans>
          </EmptyTitle>
          <EmptyDescription>
            <Trans>
              Add a tablet, phone or TV with its serial number and the PIN shown
              on its screen.
            </Trans>
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onAddDevice}>
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            <Trans>Add device</Trans>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const unassignedCount = devices.filter((device) => !device.room).length;

  return (
    <DeviceRoomActionsProvider>
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={q ?? ''}
            onChange={(value) => setFilters({ q: value || undefined })}
            placeholder={t`Search devices`}
            aria-label={t`Search name, serial number, room`}
            className="text-sm"
            wrapperClassName="min-w-56 flex-1 xl:w-72 xl:flex-none"
            debounceMs={200}
          />
          <DataGridSegmentedFilter
            label={t`Room assignment`}
            value={tab}
            onValueChange={(next) => setFilters({ tab: next })}
            allLabel={
              <TabLabel label={<Trans>All</Trans>} count={devices.length} />
            }
            options={[
              {
                value: 'assigned',
                label: (
                  <TabLabel
                    label={<Trans>Assigned</Trans>}
                    count={devices.length - unassignedCount}
                  />
                )
              },
              {
                value: 'unassigned',
                label: (
                  <TabLabel
                    label={<Trans>Unassigned</Trans>}
                    count={unassignedCount}
                  />
                )
              }
            ]}
            className="max-w-full"
          />
          <DataGridRadioFilter
            label={<Trans>Status</Trans>}
            placeholder={<Trans>All statuses</Trans>}
            value={status}
            onValueChange={(next) => setFilters({ status: next })}
            options={statusOptions}
            showFooter
            className="sm:w-[190px]"
          />
          {search.hasActiveFilters && (
            <Button
              variant="secondary"
              onClick={search.clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="mr-2 h-4 w-4" />
              <Trans>Clear filters</Trans>
            </Button>
          )}
        </div>

        <DevicesTable
          devices={page.rows}
          totalCount={matching.length}
          pageCount={page.pageCount}
          pagination={{ ...pagination, pageIndex: page.pageIndex }}
          onPaginationChange={search.onPaginationChange}
          sorting={search.sorting}
          onSortingChange={search.onSortingChange}
          highlightedId={highlightedId}
          emptyMessage={<Trans>No devices match the filters</Trans>}
          onDeviceOpen={(device) => search.openDevice(device.id)}
        />

        <DeviceDetailsDrawer
          open={search.openDeviceId !== undefined}
          device={devices.find((device) => device.id === search.openDeviceId)}
          onClose={search.closeDevice}
        />
      </div>
    </DeviceRoomActionsProvider>
  );
}

export const Route = createFileRoute('/_dashboard-layout/(user-view)/devices/')(
  {
    // A stale or hand-edited link loses its bad params, not the whole page
    validateSearch: lenientSearch(devicesSearchSchema),
    // Keep default values out of the URL
    search: {
      middlewares: [
        stripSearchParams({
          page: 1,
          per_page: DEFAULT_DEVICE_PAGE_SIZE,
          sort_order: 'asc'
        })
      ]
    },
    component: DevicesPage
  }
);
