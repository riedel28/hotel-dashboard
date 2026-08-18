import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { type PaginationState, type SortingState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { XIcon } from 'lucide-react';
import type { MonitoringStatus, MonitoringType } from 'shared/types/monitoring';

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
import { DataGridRadioFilter } from '@/components/ui/data-grid-radio-filter';
import { DataGridRefreshButton } from '@/components/ui/data-grid-refresh-button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@/components/ui/empty';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn } from '@/lib/utils';

import { StatusCell } from './-components/cells/status-cell';
import { TypeCell } from './-components/cells/type-cell';
import { MonitoringDateFilter } from './-components/monitoring-date-filter';
import { MonitoringTable } from './-components/monitoring-table';

const monitoringStatusOptions = [
  { value: 'success' },
  { value: 'error' }
] as const satisfies ReadonlyArray<{
  value: MonitoringStatus;
}>;

const monitoringTypeOptions = [
  { value: 'pms' },
  { value: 'door lock' },
  { value: 'payment' }
] as const satisfies ReadonlyArray<{
  value: MonitoringType;
}>;

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

  const handleStatusChange = (newStatus: MonitoringStatus | undefined) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        status: newStatus
      })
    });
  };

  const handleTypeChange = (newType: MonitoringType | undefined) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        type: newType
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
  const statusFilterOptions = monitoringStatusOptions.map((option) => ({
    value: option.value,
    label: <StatusCell status={option.value} />
  }));
  const typeFilterOptions = monitoringTypeOptions.map((option) => ({
    value: option.value,
    label: <TypeCell type={option.value} />
  }));
  const hasActiveFilters = Boolean(status || type || from || to);

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
                onRefresh={handleRefresh}
                className="w-auto sm:ml-0"
              />
            </EmptyContent>
          </Empty>
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
        <h1 className="text-xl font-bold">
          <Trans>Monitoring Logs</Trans>
        </h1>
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <DataGridRadioFilter
            label={<Trans>Status</Trans>}
            placeholder={<Trans>All statuses</Trans>}
            value={status}
            onValueChange={handleStatusChange}
            options={statusFilterOptions}
            showFooter
            clearLabel={<Trans>All statuses</Trans>}
            className="w-full sm:w-[170px]"
          />
          <DataGridRadioFilter
            label={<Trans>Type</Trans>}
            placeholder={<Trans>All types</Trans>}
            value={type}
            onValueChange={handleTypeChange}
            options={typeFilterOptions}
            showFooter
            clearLabel={<Trans>All types</Trans>}
            className="w-full sm:w-[170px]"
          />
          <MonitoringDateFilter
            from={from ? new Date(from) : undefined}
            to={to ? new Date(to) : undefined}
            onDateChange={handleDateChange}
            className="w-full sm:w-[220px]"
          />
          {hasActiveFilters && (
            <Button
              variant="secondary"
              onClick={handleClearFilters}
              className="w-full text-muted-foreground hover:text-foreground sm:w-auto"
            >
              <XIcon className="mr-2 h-4 w-4" />
              <Trans>Clear filters</Trans>
            </Button>
          )}
          <DataGridRefreshButton
            isRefreshing={monitoringQuery.isFetching}
            onRefresh={handleRefresh}
          />
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
