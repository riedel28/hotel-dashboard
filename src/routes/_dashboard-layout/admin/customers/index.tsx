import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { UsersIcon } from 'lucide-react';
import { fetchCustomersParamsSchema } from 'shared/types/customers';
import { perPageSchema } from 'shared/types/list-params';

import { customersQueryOptions } from '@/api/customers';
import { ClearFiltersButton } from '@/components/clear-filters-button';
import {
  EmptyFilterResult,
  EmptyTableState
} from '@/components/empty-table-state';
import { tableLoadError } from '@/components/load-error';
import { PageHeader } from '@/components/page-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { CountryPicker } from '@/components/ui/country-picker';
import { DataGridRefreshButton } from '@/components/ui/data-grid-refresh-button';
import { SearchInput } from '@/components/ui/search-input';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn } from '@/lib/utils';

import { AddCustomerDrawer } from './-components/add-customer-drawer';
import { CustomersTable } from './-components/customers-table';

// A page holds every customer most installations have, as on Properties
const PER_PAGE = 25;

function CustomersContent() {
  const search = Route.useSearch();
  const { q, country_code, sort_by, sort_order, page, per_page } = search;
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLingui();
  const customersQuery = useQuery(customersQueryOptions(search));
  const { data } = customersQuery;

  // Every change but a page turn goes back to the first page
  const setSearch = (changes: Partial<typeof search>) =>
    navigate({
      to: '/admin/customers',
      search: (prev) => ({ ...prev, page: 1, ...changes })
    });
  // Back to the plain list: the sort goes too
  const clearFilters = () =>
    setSearch({
      q: undefined,
      country_code: undefined,
      sort_by: undefined,
      sort_order: undefined
    });

  return (
    <div className="flex flex-col gap-3">
      {/* One row from `sm` up. On a phone the search shares its row with
          refresh, the country goes under them. */}
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <SearchInput
          value={q || ''}
          onChange={(term) => setSearch({ q: term || undefined })}
          placeholder={t`Search customers`}
          wrapperClassName="min-w-0 flex-1 sm:max-w-[250px] sm:min-w-36"
          debounceMs={500}
        />
        <CountryPicker
          value={country_code}
          onValueChange={(code) =>
            setSearch({ country_code: code || undefined })
          }
          placeholder={t`All countries`}
          className="order-last w-full sm:order-none sm:w-45 sm:shrink-0"
        />
        {/* Its kept place only matters on the one-row bar */}
        <div
          className={cn('shrink-0', !(q || country_code) && 'max-sm:hidden')}
        >
          <ClearFiltersButton
            hasActiveFilters={Boolean(q || country_code)}
            onClear={clearFilters}
          />
        </div>
        <DataGridRefreshButton
          isRefreshing={customersQuery.isFetching}
          onRefresh={() =>
            queryClient.invalidateQueries({ queryKey: ['customers'] })
          }
        />
      </div>
      <div
        className={cn('transition-opacity duration-300 ease-in-out', {
          'opacity-70': customersQuery.isFetching && !customersQuery.isLoading
        })}
      >
        <CustomersTable
          page={{
            rows: data?.index ?? [],
            pageIndex: (page ?? 1) - 1,
            pageSize: per_page ?? PER_PAGE,
            pageCount: data?.page_count ?? 0,
            totalCount: data?.total ?? 0
          }}
          isLoading={customersQuery.isLoading}
          error={tableLoadError(
            customersQuery,
            <Trans>Couldn't load customers</Trans>
          )}
          sort={sort_by && { by: sort_by, order: sort_order ?? 'asc' }}
          onSortChange={(sort) =>
            setSearch({ sort_by: sort?.by, sort_order: sort?.order })
          }
          onPageChange={(pageIndex, per_page) =>
            setSearch({ page: pageIndex + 1, per_page })
          }
          emptyMessage={
            q || country_code ? (
              <EmptyFilterResult
                description={<Trans>No customers match the filters.</Trans>}
                onClearFilters={clearFilters}
              />
            ) : (
              <EmptyTableState
                icon={<UsersIcon />}
                title={<Trans>No customers yet</Trans>}
              />
            )
          }
        />
      </div>
    </div>
  );
}

function CustomersPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Customers`);

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
            <BreadcrumbLink to="/admin">
              <Trans>Admin</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Trans>Customers</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title={<Trans>Customers</Trans>}
        description={
          <Trans>
            Manage the customers that own properties and their contact details.
          </Trans>
        }
        actions={<AddCustomerDrawer />}
      />

      <CustomersContent />
    </div>
  );
}

export const Route = createFileRoute('/_dashboard-layout/admin/customers/')({
  validateSearch: (search) =>
    fetchCustomersParamsSchema
      .extend({ per_page: perPageSchema.default(PER_PAGE).optional() })
      .parse(search),
  loaderDeps: ({ search }) => search,
  // Waited for, but a failure isn't thrown here: it would take the whole page
  // down. The query keeps the error, and the list shows it under the filters.
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.prefetchQuery(customersQueryOptions(deps)),
  component: CustomersPage
});
