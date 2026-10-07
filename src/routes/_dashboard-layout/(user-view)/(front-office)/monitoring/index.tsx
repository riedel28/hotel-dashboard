import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { type PaginationState, type SortingState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { ListFilterIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import type {
  FetchMonitoringLogsParams,
  MonitoringPeriod,
  MonitoringStatus,
  MonitoringType
} from 'shared/types/monitoring';

import {
  fetchMonitoringLogsParamsSchema,
  monitoringQueryOptions
} from '@/api/monitoring';
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
import {
  DataGridCheckboxFilter,
  DataGridCheckboxFilterClear,
  DataGridCheckboxFilterFooter
} from '@/components/ui/data-grid-checkbox-filter';
import { DataGridRadioFilter } from '@/components/ui/data-grid-radio-filter';
import { DataGridRefreshButton } from '@/components/ui/data-grid-refresh-button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@/components/ui/empty';
import { SearchInput } from '@/components/ui/search-input';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { lenientSearch } from '@/lib/search-params';
import { cn } from '@/lib/utils';

import { StatusCell } from './-components/cells/status-cell';
import { TypeCell } from './-components/cells/type-cell';
import { MonitoringPeriodFilter } from './-components/monitoring-period-filter';
import { MonitoringTable } from './-components/monitoring-table';

const DEFAULT_PERIOD: MonitoringPeriod = '24h';
const DEFAULT_PAGE_SIZE = 50;

const monitoringStatuses = ['success', 'error'] satisfies MonitoringStatus[];

const monitoringTypeOptions = (
  ['pms', 'door lock', 'payment'] satisfies MonitoringType[]
).map((value) => ({ value, label: <TypeCell type={value} /> }));

type MonitoringSearch = FetchMonitoringLogsParams;

/** How many logs an option of the status filter would show. */
function LogCount({ count }: { count: number | undefined }) {
  if (count === undefined) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      color="gray"
      size="xs"
      className="px-1 py-0 leading-4 tabular-nums"
    >
      {count}
    </Badge>
  );
}

function MonitoringPage() {
  const search = Route.useSearch();
  const { page, per_page, q, status, type, booking_nr, from, to } = search;
  const navigate = Route.useNavigate();
  const { t } = useLingui();
  useDocumentTitle(t`Monitoring`);
  // SearchInput keeps its own text; bumping the key empties it on reset
  const [searchResetKey, setSearchResetKey] = useState(0);

  const hasCustomRange = Boolean(from || to);
  const period = hasCustomRange ? undefined : (search.period ?? DEFAULT_PERIOD);
  const pageSize = per_page ?? DEFAULT_PAGE_SIZE;

  const monitoringQuery = useQuery(
    monitoringQueryOptions({ ...search, period, per_page: pageSize })
  );

  // Filters replace the history entry and always return to the first page
  const setFilters = (filters: Partial<MonitoringSearch>) => {
    navigate({
      search: (prev) => ({ ...prev, ...filters, page: undefined }),
      replace: true
    });
  };

  const handleBookingFilterToggle = (bookingNr: string) => {
    setFilters({
      booking_nr: bookingNr === booking_nr ? undefined : bookingNr
    });
  };

  const handleClearFilters = () => {
    setSearchResetKey((key) => key + 1);
    setFilters({
      q: undefined,
      status: undefined,
      type: undefined,
      booking_nr: undefined,
      period: undefined,
      from: undefined,
      to: undefined
    });
  };

  const handlePaginationChange = (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) => {
    const pagination =
      typeof updaterOrValue === 'function'
        ? updaterOrValue({ pageIndex: (page ?? 1) - 1, pageSize })
        : updaterOrValue;

    navigate({
      search: (prev) => ({
        ...prev,
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize
      }),
      replace: true
    });
  };

  const sorting: SortingState = [
    {
      id: search.sort_by ?? 'logged_at',
      desc: (search.sort_order ?? 'desc') === 'desc'
    }
  ];

  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const [firstSort] =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting)
        : updaterOrValue;

    setFilters({
      sort_by: firstSort?.id as MonitoringSearch['sort_by'],
      sort_order: firstSort?.desc === false ? 'asc' : 'desc'
    });
  };

  const hasActiveFilters = Boolean(
    q ||
    status ||
    type?.length ||
    booking_nr ||
    hasCustomRange ||
    period !== DEFAULT_PERIOD
  );
  // Each count ignores the status filter itself, so the options show what
  // picking them would yield
  const counts = monitoringQuery.data?.counts;
  const statusOptions = monitoringStatuses.map((value) => ({
    value,
    label: (
      <>
        <StatusCell status={value} />
        {/* Only in the menu rows, pushed to their right edge; the trigger has
            no room for it next to the selected badge */}
        <span className="ml-auto hidden in-data-[slot=dropdown-menu-radio-item]:block">
          <LogCount count={counts?.[value]} />
        </span>
      </>
    )
  }));

  const emptyMessage = (
    <div className="flex flex-col items-center gap-1 py-6 text-sm">
      <p className="font-medium text-foreground">
        {hasActiveFilters ? (
          <Trans>Nothing found</Trans>
        ) : (
          <Trans>No logs in the last 24 hours</Trans>
        )}
      </p>
      <p className="text-muted-foreground">
        {hasActiveFilters ? (
          <Trans>No logs match the current filters.</Trans>
        ) : (
          <Trans>Pick a longer period to see older logs.</Trans>
        )}
      </p>
      {hasActiveFilters && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-2"
          onClick={handleClearFilters}
        >
          <Trans>Clear filters</Trans>
        </Button>
      )}
    </div>
  );

  const renderTableContent = () => {
    if (monitoringQuery.isError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Empty variant="destructive" className="w-md max-w-md">
            <EmptyHeader>
              <EmptyTitle>
                <Trans>Something went wrong</Trans>
              </EmptyTitle>
              <EmptyDescription>
                {monitoringQuery.error.message || (
                  <Trans>
                    An error occurred while fetching monitoring logs
                  </Trans>
                )}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <DataGridRefreshButton
                variant="destructive"
                isRefreshing={monitoringQuery.isFetching}
                onRefresh={() => monitoringQuery.refetch()}
                className="w-auto sm:ml-0"
              />
            </EmptyContent>
          </Empty>
        </div>
      );
    }

    return (
      <MonitoringTable
        data={monitoringQuery.data?.index ?? []}
        isLoading={monitoringQuery.isLoading}
        pageIndex={(page ?? 1) - 1}
        pageSize={pageSize}
        totalCount={monitoringQuery.data?.total ?? 0}
        pageCount={monitoringQuery.data?.page_count ?? 0}
        onPaginationChange={handlePaginationChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        bookingFilter={booking_nr}
        onBookingFilterToggle={handleBookingFilterToggle}
        emptyMessage={emptyMessage}
      />
    );
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
              <Trans>Monitoring</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex justify-between">
        <h1 className="text-xl font-bold">
          <Trans>Monitoring Logs</Trans>
        </h1>
      </div>

      <div className="space-y-2.5">
        {/* One wrapping row. Phones: two filters to a row (type gets a little
            more than half so its widest badge fits),
            then Clear filters as a full row. In between: search stretches to
            fill its row.
            Wide screens: everything in one line, Clear filters on the right. */}
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            key={searchResetKey}
            value={q ?? ''}
            onChange={(value) => setFilters({ q: value || undefined })}
            placeholder={t`Search logs`}
            aria-label={t`Search event, message, reservation number`}
            className="text-sm"
            wrapperClassName="min-w-0 flex-1 basis-[calc(50%-0.25rem)] sm:w-auto sm:min-w-56 sm:basis-auto xl:w-72 xl:flex-none"
            debounceMs={300}
          />
          <DataGridRadioFilter
            label={<Trans>Status</Trans>}
            placeholder={
              <span className="flex items-center gap-1.5">
                <Trans>All logs</Trans>
                <LogCount count={counts?.all} />
              </span>
            }
            value={status}
            onValueChange={(next) => setFilters({ status: next })}
            options={statusOptions}
            showFooter
            className="min-w-0 flex-1 basis-[calc(50%-0.25rem)] sm:w-[170px] sm:flex-none sm:basis-auto"
          />
          <DataGridCheckboxFilter
            label={<Trans>Type</Trans>}
            placeholder={<Trans>All types</Trans>}
            options={monitoringTypeOptions}
            value={type ?? []}
            onValueChange={(next) =>
              setFilters({ type: next.length > 0 ? next : undefined })
            }
            className="min-w-0 flex-1 basis-[calc(55%-0.25rem)] sm:w-[200px] sm:flex-none sm:basis-auto"
          >
            <DataGridCheckboxFilterFooter>
              <DataGridCheckboxFilterClear>
                <Trans>Reset</Trans>
              </DataGridCheckboxFilterClear>
            </DataGridCheckboxFilterFooter>
          </DataGridCheckboxFilter>
          <MonitoringPeriodFilter
            period={period}
            from={from}
            to={to}
            onPeriodChange={(next) =>
              setFilters({
                period: next,
                from: undefined,
                to: undefined
              })
            }
            onRangeChange={(range) =>
              setFilters({
                period: undefined,
                from: dayjs(range.from).format('YYYY-MM-DD'),
                to: dayjs(range.to).format('YYYY-MM-DD')
              })
            }
            className="min-w-0 flex-1 basis-[calc(45%-0.25rem)] sm:flex-none sm:basis-auto"
          />
          {hasActiveFilters && (
            <Button
              variant="secondary"
              onClick={handleClearFilters}
              className="w-full text-muted-foreground hover:text-foreground sm:ml-auto sm:w-auto"
            >
              <XIcon className="mr-2 h-4 w-4" />
              <Trans>Clear filters</Trans>
            </Button>
          )}
        </div>

        {/* The reservation filter narrows the whole view, so it is announced
            right above the table rather than as one more control in the bar */}
        {booking_nr && (
          <div
            role="status"
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-foreground/10 bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-sky-800/20 dark:text-sky-300"
          >
            <ListFilterIcon className="size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <Trans>
                Showing only logs for reservation{' '}
                <strong className="font-semibold">{booking_nr}</strong>
              </Trans>
            </span>
            <button
              type="button"
              onClick={() => setFilters({ booking_nr: undefined })}
              className="inline-flex cursor-pointer items-center gap-1 rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trans>Show all logs</Trans>
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <div
          className={cn(
            'opacity-100 transition-opacity duration-300 ease-in-out',
            {
              'opacity-70': monitoringQuery.isFetching
            }
          )}
        >
          {renderTableContent()}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/monitoring/'
)({
  // A stale or hand-edited link loses its bad params, not the whole page
  validateSearch: lenientSearch(fetchMonitoringLogsParamsSchema),
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
