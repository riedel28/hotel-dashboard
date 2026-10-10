import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { ListFilterIcon, XIcon } from 'lucide-react';
import { z } from 'zod';

import { fetchMonitoringLogsParamsSchema } from '@/api/monitoring';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { DataGridRefreshButton } from '@/components/ui/data-grid-refresh-button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@/components/ui/empty';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { lenientSearch } from '@/lib/search-params';
import { cn } from '@/lib/utils';

import { LogDetailsDrawer } from './-components/log-details-drawer';
import { MonitoringFilters } from './-components/monitoring-filters';
import { MonitoringTable } from './-components/monitoring-table';
import {
  DEFAULT_PAGE_SIZE,
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

      {/* As tall as the same row on pages that have an action button in it */}
      <div className="mb-6 flex min-h-9 justify-between">
        <h1 className="text-xl font-bold">
          <Trans>Monitoring Logs</Trans>
        </h1>
      </div>

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
          {logsQuery.isError ? (
            <LoadError
              message={logsQuery.error.message}
              isRetrying={logsQuery.isFetching}
              onRetry={() => logsQuery.refetch()}
            />
          ) : (
            <MonitoringTable
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
          )}
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
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-foreground/10 bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-sky-800/20 dark:text-sky-300"
    >
      <ListFilterIcon className="size-4 shrink-0" aria-hidden="true" />
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
    </div>
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
      <div className="flex flex-col items-center gap-1 py-6 text-sm">
        <p className="font-medium text-foreground">
          <Trans>No logs in the last 24 hours</Trans>
        </p>
        <p className="text-muted-foreground">
          <Trans>Pick a longer period to see older logs.</Trans>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 py-6 text-sm">
      <p className="font-medium text-foreground">
        <Trans>Nothing found</Trans>
      </p>
      <p className="text-muted-foreground">
        <Trans>No logs match the current filters.</Trans>
      </p>
      <Button
        variant="secondary"
        size="sm"
        className="mt-2"
        onClick={onClearFilters}
      >
        <Trans>Clear filters</Trans>
      </Button>
    </div>
  );
}

function LoadError({
  message,
  isRetrying,
  onRetry
}: {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Empty variant="destructive" className="w-md max-w-md">
        <EmptyHeader>
          <EmptyTitle>
            <Trans>Something went wrong</Trans>
          </EmptyTitle>
          <EmptyDescription>
            {message || (
              <Trans>An error occurred while fetching monitoring logs</Trans>
            )}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <DataGridRefreshButton
            variant="destructive"
            isRefreshing={isRetrying}
            onRefresh={onRetry}
            className="w-auto sm:ml-0"
          />
        </EmptyContent>
      </Empty>
    </div>
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
      stripSearchParams({
        page: 1,
        per_page: DEFAULT_PAGE_SIZE,
        period: DEFAULT_PERIOD,
        sort_by: 'logged_at',
        sort_order: 'desc'
      })
    ]
  },
  component: MonitoringPage
});
