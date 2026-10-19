import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { ListFilterIcon, SquareActivityIcon, XIcon } from 'lucide-react';
import { z } from 'zod';

import { fetchMonitoringLogsParamsSchema } from '@/api/monitoring';
import {
  EmptyFilterResult,
  EmptyTableState
} from '@/components/empty-table-state';
import { tableLoadError } from '@/components/load-error';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { lenientSearch } from '@/lib/search-params';
import { cn } from '@/lib/utils';

import { LogDetailsDrawer } from './-components/log-details-drawer';
import { MonitoringFilters } from './-components/monitoring-filters';
import { MonitoringTable } from './-components/monitoring-table';
import {
  DEFAULT_PERIOD,
  useMonitoringSearch,
  useReservationFilter
} from './-hooks/use-monitoring-search';

// The page's own state on top of the list filters: the log open in the drawer
const monitoringSearchSchema = fetchMonitoringLogsParamsSchema.extend({
  log: z.coerce.number().int().positive().optional()
});

function MonitoringPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Monitoring`);
  const search = useMonitoringSearch();
  const { logsQuery, filters } = search;
  const logs = logsQuery.data?.index ?? [];

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
              <Trans>Monitoring</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title={<Trans>Monitoring Logs</Trans>}
        description={
          <Trans>
            Track PMS, door lock and payment events and spot failed ones.
          </Trans>
        }
      />

      <div className="space-y-2.5">
        <MonitoringFilters
          filters={filters}
          counts={logsQuery.data?.counts}
          hasActiveFilters={search.hasActiveFilters}
          setQuery={search.setQuery}
          setStatus={search.setStatus}
          setTypes={search.setTypes}
          setPeriod={search.setPeriod}
          setRange={search.setRange}
          clearFilters={search.clearFilters}
        />

        <ReservationNotice />

        <div
          className={cn('transition-opacity duration-300 ease-in-out', {
            'opacity-70': logsQuery.isFetching
          })}
        >
          <MonitoringTable
            error={tableLoadError(
              logsQuery,
              <Trans>Couldn't load monitoring logs</Trans>
            )}
            data={logs}
            isLoading={logsQuery.isLoading}
            totalCount={logsQuery.data?.total ?? 0}
            pageCount={logsQuery.data?.page_count ?? 0}
            pagination={search.pagination}
            onPaginationChange={search.onPaginationChange}
            sorting={search.sorting}
            onSortingChange={search.onSortingChange}
            selectedLogId={search.openLogId}
            onLogOpen={search.openLog}
            emptyMessage={
              <EmptyLogs
                isFiltered={search.hasActiveFilters}
                onClearFilters={search.clearFilters}
              />
            }
          />
        </div>
      </div>

      <LogDetailsDrawer
        logId={search.openLogId}
        pageLogs={logs}
        onSelect={search.selectLog}
        onClose={search.closeLog}
        onShowReservationLogs={search.showReservationLogs}
      />
    </div>
  );
}

/**
 * The reservation filter narrows the whole view, so it is announced right
 * above the table rather than as one more control among the filters.
 */
function ReservationNotice() {
  const { reservation, clear } = useReservationFilter();

  if (!reservation) {
    return null;
  }

  return (
    <Alert variant="info" role="status">
      <ListFilterIcon aria-hidden="true" />
      <AlertDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="min-w-0 flex-1">
          <Trans>
            Showing only logs for reservation{' '}
            <strong className="font-semibold">{reservation}</strong>
          </Trans>
        </span>
        <button
          type="button"
          onClick={clear}
          className="inline-flex cursor-pointer items-center gap-1 rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trans>Show all logs</Trans>
          <XIcon className="size-4" aria-hidden="true" />
        </button>
      </AlertDescription>
    </Alert>
  );
}

function EmptyLogs({
  isFiltered,
  onClearFilters
}: {
  isFiltered: boolean;
  onClearFilters: () => void;
}) {
  if (!isFiltered) {
    return (
      <EmptyTableState
        icon={<SquareActivityIcon />}
        title={<Trans>No logs in the last 24 hours</Trans>}
        description={<Trans>Pick a longer period to see older logs.</Trans>}
      />
    );
  }

  return (
    <EmptyFilterResult
      description={<Trans>No logs match the current filters.</Trans>}
      onClearFilters={onClearFilters}
    />
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/monitoring/'
)({
  // A stale or hand-edited link loses its bad params, not the whole page
  validateSearch: lenientSearch(monitoringSearchSchema),
  // Keep default values out of the URL
  search: {
    middlewares: [
      // Parsing nothing gives exactly the schema's defaults
      stripSearchParams({
        ...fetchMonitoringLogsParamsSchema.parse({}),
        period: DEFAULT_PERIOD
      })
    ]
  },
  component: MonitoringPage
});
