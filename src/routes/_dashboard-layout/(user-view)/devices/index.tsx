import { Trans, useLingui } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { PlusCircleIcon, TabletSmartphoneIcon } from 'lucide-react';
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { paginate } from '@/lib/paginate';
import { lenientSearch } from '@/lib/search-params';

import { ClaimDeviceModal } from './-components/claim-device-modal';
import { DeviceDetailsDrawer } from './-components/device-details-drawer';
import { DeviceRoomActionsProvider } from './-components/device-room-actions';
import { DevicesFilters } from './-components/devices-filters';
import {
  DevicesTable,
  DevicesTableSkeleton
} from './-components/devices-table';
import { getDevices, useDevices } from './-hooks/use-devices';
import { useDevicesSearch } from './-hooks/use-devices-search';
import {
  DEFAULT_DEVICE_PAGE_SIZE,
  DEVICE_PAGE_SIZES,
  deviceSortColumnSchema,
  deviceTabSchema,
  listDevices
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

function DevicesPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Devices`);
  const queryClient = useQueryClient();
  const { sort, pageSize, showUnfiltered } = useDevicesSearch();

  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number>();

  useEffect(() => {
    if (highlightedId === undefined) return;
    const timeout = setTimeout(() => setHighlightedId(undefined), HIGHLIGHT_MS);
    return () => clearTimeout(timeout);
  }, [highlightedId]);

  // Brings the new device into view: filters could hide it and it may sit on
  // any page, so they are dropped and its page is opened. The list in the
  // cache already has it — the dialog refetches before reporting the claim.
  const handleClaimed = (claimed: Device) => {
    const index = listDevices(getDevices(queryClient), {}, sort).findIndex(
      (device) => device.id === claimed.id
    );
    showUnfiltered(Math.floor(Math.max(index, 0) / pageSize));
    setHighlightedId(claimed.id);
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

function NoDevices({ onAddDevice }: { onAddDevice: () => void }) {
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

interface DevicesContentProps {
  highlightedId: number | undefined;
  onAddDevice: () => void;
}

function DevicesContent({ highlightedId, onAddDevice }: DevicesContentProps) {
  const devices = useDevices();
  const search = useDevicesSearch();
  const { filters, sort } = search;

  const listed = useMemo(
    () => listDevices(devices, filters, sort),
    [devices, filters, sort]
  );

  if (devices.length === 0) {
    return <NoDevices onAddDevice={onAddDevice} />;
  }

  return (
    <DeviceRoomActionsProvider>
      <div className="space-y-2.5">
        <DevicesFilters
          devices={devices}
          filters={filters}
          hasActiveFilters={search.hasActiveFilters}
          setFilters={search.setFilters}
          clearFilters={search.clearFilters}
        />

        <DevicesTable
          page={paginate(listed, search.pageIndex, search.pageSize)}
          sort={sort}
          onSortChange={search.setSort}
          onPageChange={search.setPage}
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
