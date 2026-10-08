import { Trans, useLingui } from '@lingui/react/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PlusCircleIcon, TabletSmartphoneIcon, XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  type Device,
  type DeviceConnectionStatus,
  deviceConnectionStatusSchema
} from 'shared/types/devices';
import { z } from 'zod';

import { devicesQueryOptions } from '@/api/devices';
import { QueryBoundary } from '@/components/query-boundary';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
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
import { DevicesTable } from './-components/devices-table';
import { type DeviceTab, filterDevices } from './-lib/devices';

const devicesSearchSchema = z.object({
  tab: z.enum(['assigned', 'unassigned']).optional(),
  // A room number typed into the URL by hand arrives as a number
  q: z.union([z.string(), z.number().transform(String)]).optional(),
  status: deviceConnectionStatusSchema.optional()
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
      <Badge
        variant="secondary"
        color="gray"
        size="xs"
        className="px-1 py-0 leading-4 tabular-nums"
      >
        {count}
      </Badge>
    </span>
  );
}

function DevicesPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Devices`);
  const navigate = Route.useNavigate();

  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number>();
  // SearchInput keeps its own text; bumping the key empties it on reset
  const [searchResetKey, setSearchResetKey] = useState(0);

  useEffect(() => {
    if (highlightedId === undefined) return;
    const timeout = setTimeout(() => setHighlightedId(undefined), HIGHLIGHT_MS);
    return () => clearTimeout(timeout);
  }, [highlightedId]);

  // The search box is remounted once the URL is clean; any earlier and it
  // would pick the old query up again.
  const clearFilters = async () => {
    await navigate({ search: {}, replace: true });
    setSearchResetKey((key) => key + 1);
  };

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
        fallback={<DevicesLoading />}
      >
        <DevicesContent
          highlightedId={highlightedId}
          searchResetKey={searchResetKey}
          onClearFilters={clearFilters}
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

// The table under an empty row as tall as the filters, so it does not move
// when the devices arrive and the filters appear above it.
function DevicesLoading() {
  return (
    <div className="space-y-2.5">
      <div className="h-9" />
      <DevicesTable isLoading />
    </div>
  );
}

interface DevicesContentProps {
  highlightedId: number | undefined;
  searchResetKey: number;
  onClearFilters: () => void;
  onAddDevice: () => void;
}

function DevicesContent({
  highlightedId,
  searchResetKey,
  onClearFilters,
  onAddDevice
}: DevicesContentProps) {
  const { t } = useLingui();
  const { tab, q, status } = Route.useSearch();
  const navigate = Route.useNavigate();

  // Statuses are computed for the moment the list was fetched, which the
  // query's refetch interval keeps within a minute of now.
  const { data: devices, dataUpdatedAt: now } = useSuspenseQuery(
    devicesQueryOptions()
  );

  const rows = useMemo(
    () => filterDevices(devices, { tab, q, status }, now),
    [devices, tab, q, status, now]
  );

  const setFilters = (filters: {
    tab?: DeviceTab;
    q?: string;
    status?: DeviceConnectionStatus;
  }) =>
    navigate({ search: (prev) => ({ ...prev, ...filters }), replace: true });

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
  const hasActiveFilters = Boolean(tab || q || status);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          key={searchResetKey}
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
        {hasActiveFilters && (
          <Button
            variant="secondary"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon className="mr-2 h-4 w-4" />
            <Trans>Clear filters</Trans>
          </Button>
        )}
      </div>

      <DevicesTable
        data={rows}
        now={now}
        highlightedId={highlightedId}
        emptyMessage={<Trans>No devices match the filters</Trans>}
      />
    </div>
  );
}

export const Route = createFileRoute('/_dashboard-layout/(user-view)/devices/')(
  {
    // A stale or hand-edited link loses its bad params, not the whole page
    validateSearch: lenientSearch(devicesSearchSchema),
    component: DevicesPage
  }
);
