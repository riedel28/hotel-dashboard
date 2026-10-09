import { Trans, useLingui } from '@lingui/react/macro';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { fetchCustomersParamsSchema } from 'shared/types/customers';

import { customersQueryOptions } from '@/api/customers';
import { ClearFiltersButton } from '@/components/clear-filters-button';
import { FiltersBar } from '@/components/filters-bar';
import { QueryBoundary } from '@/components/query-boundary';
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
import {
  CustomersTable,
  CustomersTableSkeleton
} from './-components/customers-table';

function CustomersContent() {
  const search = Route.useSearch();
  const { q, country_code, sort_by, sort_order } = search;
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLingui();

  const { data, isFetching } = useSuspenseQuery(customersQueryOptions(search));

  // Every change but a page turn goes back to the first page
  const setSearch = (changes: Partial<typeof search>) =>
    navigate({
      to: '/admin/customers',
      search: (prev) => ({ ...prev, page: 1, ...changes })
    });

  return (
    <div
      className={cn(
        'flex flex-col gap-3 opacity-100 transition-opacity duration-300 ease-in-out',
        { 'opacity-70': isFetching }
      )}
    >
      <FiltersBar>
        <SearchInput
          value={q || ''}
          onChange={(term) => setSearch({ q: term || undefined })}
          placeholder={t`Search customers`}
          wrapperClassName="w-full sm:w-[250px]"
          debounceMs={500}
        />
        <CountryPicker
          value={country_code}
          onValueChange={(code) =>
            setSearch({ country_code: code || undefined })
          }
          placeholder={t`All countries`}
          className="w-full sm:w-45"
        />
        <ClearFiltersButton
          hasActiveFilters={Boolean(q || country_code)}
          // Back to the plain list: the sort goes too
          onClear={() =>
            setSearch({
              q: undefined,
              country_code: undefined,
              sort_by: undefined,
              sort_order: undefined
            })
          }
        />
        <DataGridRefreshButton
          isRefreshing={isFetching}
          onRefresh={() =>
            queryClient.invalidateQueries({ queryKey: ['customers'] })
          }
        />
      </FiltersBar>
      <CustomersTable
        page={{
          rows: data.index,
          pageIndex: data.page - 1,
          pageSize: data.per_page,
          pageCount: data.page_count,
          totalCount: data.total
        }}
        sort={sort_by && { by: sort_by, order: sort_order ?? 'asc' }}
        onSortChange={(sort) =>
          setSearch({ sort_by: sort?.by, sort_order: sort?.order })
        }
        onPageChange={(pageIndex, per_page) =>
          setSearch({ page: pageIndex + 1, per_page })
        }
        emptyMessage={
          q || country_code ? (
            <Trans>No customers match the filters</Trans>
          ) : undefined
        }
      />
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

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">
            <Trans>Customers</Trans>
          </h1>
          <p className="text-sm text-muted-foreground">
            <Trans>
              Manage the customers that own properties and their contact
              details.
            </Trans>
          </p>
        </div>
        <AddCustomerDrawer />
      </div>

      <QueryBoundary
        className="min-h-[60vh] items-center justify-center"
        message={<Trans>An error occurred while fetching customers</Trans>}
        fallback={<CustomersTableSkeleton />}
      >
        <CustomersContent />
      </QueryBoundary>
    </div>
  );
}

export const Route = createFileRoute('/_dashboard-layout/admin/customers/')({
  validateSearch: (search) => fetchCustomersParamsSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(customersQueryOptions(deps));
  },
  component: CustomersPage
});
