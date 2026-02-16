import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { type PaginationState, type SortingState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { RefreshCw, XIcon } from 'lucide-react';
import {
  fetchMonitoringLogsParamsSchema,
  monitoringQueryOptions
} from '@/api/monitoring';

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
  ErrorDisplayActions,
  ErrorDisplayError,
  ErrorDisplayMessage,
  ErrorDisplayTitle
} from '@/components/ui/error-display';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn } from '@/lib/utils';

import { MonitoringDateFilter } from './-components/monitoring-date-filter';
import { MonitoringTable } from './-components/monitoring-table';

function MonitoringPage() {
  const { page, per_page, status, type, from, to, sort_by, sort_order } =
    Route.useSearch();
  const navigate = Route.useNavigate();
  const { t } = useLingui();
  useDocumentTitle(t`Monitoring`);

  const monitoringQuery = useQuery(
    monitoringQueryOptions({
      page,
      per_page,
      status,
      type,
      from,
      to,
      sort_by,
      sort_order
    })
  );

  const handleRefresh = () => {
    monitoringQuery.refetch();
  };

  const handleStatusChange = (newStatus: string | null) => {
    if (!newStatus) return;
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        status:
          newStatus === 'all' ? undefined : (newStatus as 'success' | 'error')
      })
    });
  };

  const handleDateChange = (
    dateRange: { from?: Date; to?: Date } | undefined
  ) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        from: dateRange?.from
          ? dayjs(dateRange.from).format('YYYY-MM-DD')
          : undefined,
        to: dateRange?.to ? dayjs(dateRange.to).format('YYYY-MM-DD') : undefined
      })
    });
  };

  const handlePaginationChange = (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) => {
    const pagination =
      typeof updaterOrValue === 'function'
        ? updaterOrValue({
            pageIndex: (page ?? 1) - 1,
            pageSize: per_page ?? 10
          })
        : updaterOrValue;

    navigate({
      search: (prev) => ({
        ...prev,
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize
      })
    });
  };

  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const sorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(
            sort_by
              ? [{ id: sort_by, desc: sort_order === 'desc' }]
              : [{ id: 'logged_at', desc: true }]
          )
        : updaterOrValue;

    const firstSort = sorting[0];
    if (firstSort) {
      navigate({
        search: (prev) => ({
          ...prev,
          page: 1,
          sort_by: firstSort.id as
            | 'logged_at'
            | 'status'
            | 'type'
            | 'booking_nr'
            | 'event',
          sort_order: firstSort.desc ? ('desc' as const) : ('asc' as const)
        })
      });
    } else {
      navigate({
        search: (prev) => ({
          ...prev,
          page: 1,
          sort_by: undefined,
          sort_order: undefined
        })
      });
    }
  };

  const handleClearFilters = () => {
    navigate({
      search: {
        page: 1,
        per_page: per_page,
        status: undefined,
        type: undefined,
        from: undefined,
        to: undefined,
        sort_by: undefined,
        sort_order: undefined
      }
    });
  };

  const sorting: SortingState = sort_by
    ? [{ id: sort_by, desc: sort_order === 'desc' }]
    : [{ id: 'logged_at', desc: true }];

  const renderTableContent = () => {
    if (monitoringQuery.isLoading) {
      return (
        <MonitoringTable
          data={[]}
          isLoading={true}
          pageIndex={(page ?? 1) - 1}
          pageSize={per_page ?? 10}
          totalCount={0}
          pageCount={0}
          onPaginationChange={handlePaginationChange}
          sorting={sorting}
          onSortingChange={handleSortingChange}
        />
      );
    }

    if (monitoringQuery.isError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <ErrorDisplayError className="w-md max-w-md">
            <ErrorDisplayTitle>
              <Trans>Something went wrong</Trans>
            </ErrorDisplayTitle>
            <ErrorDisplayMessage>
              {monitoringQuery.error.message || (
                <Trans>An error occurred while fetching monitoring logs</Trans>
              )}
            </ErrorDisplayMessage>
            <ErrorDisplayActions>
              <Button variant="destructive" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                <Trans>Refresh</Trans>
              </Button>
            </ErrorDisplayActions>
          </ErrorDisplayError>
        </div>
      );
    }

    if (monitoringQuery.data) {
      return (
        <MonitoringTable
          data={monitoringQuery.data.index}
          pageIndex={(page ?? 1) - 1}
          pageSize={per_page ?? 10}
          totalCount={monitoringQuery.data.total}
          pageCount={monitoringQuery.data.page_count}
          onPaginationChange={handlePaginationChange}
          sorting={sorting}
          onSortingChange={handleSortingChange}
        />
      );
    }

    return null;
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
        <h1 className="text-2xl font-bold">
          <Trans>Monitoring Logs</Trans>
        </h1>
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select
                value={status ?? 'all'}
                onValueChange={handleStatusChange}
                defaultValue="all"
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue>
                    {(value) =>
                      value ? (
                        <span className="capitalize">{t(value)}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          <Trans>Select status</Trans>
                        </span>
                      )
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-gray-500"></span>
                      <span>
                        <Trans>All Statuses</Trans>
                      </span>
                    </span>
                  </SelectItem>
                  <SelectItem value="success">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-green-500"></span>
                      <span>
                        <Trans>Success</Trans>
                      </span>
                    </span>
                  </SelectItem>
                  <SelectItem value="error">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-red-500"></span>
                      <span>
                        <Trans>Error</Trans>
                      </span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <MonitoringDateFilter
                from={from ? new Date(from) : undefined}
                to={to ? new Date(to) : undefined}
                onDateChange={handleDateChange}
                className="w-full sm:w-[220px]"
              />
              {(from || to || status) && (
                <Button
                  variant="secondary"
                  onClick={handleClearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="mr-2 h-4 w-4" />
                  <Trans>Clear filters</Trans>
                </Button>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={monitoringQuery.isFetching}
            className="w-full sm:w-auto"
          >
            <RefreshCw
              className={cn(
                'mr-2 h-4 w-4',
                monitoringQuery.isFetching && 'animate-spin'
              )}
            />
            <Trans>Refresh</Trans>
          </Button>
        </div>

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
  validateSearch: (search) => fetchMonitoringLogsParamsSchema.parse(search),
  component: MonitoringPage
});
