import { Trans, useLingui } from '@lingui/react/macro';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { fetchCustomersParamsSchema } from 'shared/types/customers';
import { perPageSchema } from 'shared/types/list-params';

import { customersQueryOptions } from '@/api/customers';
import { ClearFiltersButton } from '@/components/clear-filters-button';
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

// A page holds every customer most installations have, as on Properties
const PER_PAGE = 25;

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
        </div>
        <DataGridRefreshButton
          isRefreshing={isFetching}
          onRefresh={() =>
            queryClient.invalidateQueries({ queryKey: ['customers'] })
          }
        />
      </div>
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

      {/* The title and its action share a row; the description runs under
          both, so on a phone it is not squeezed beside the button */}
      <div className="mb-6 space-y-1">
        <div className="flex min-h-9 items-center justify-between gap-3">
          <h1 className="text-xl font-bold">
            <Trans>Customers</Trans>
          </h1>
          <AddCustomerDrawer />
        </div>
        <p className="text-sm text-muted-foreground">
          <Trans>
            Manage the customers that own properties and their contact details.
          </Trans>
        </p>
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
  validateSearch: (search) =>
    fetchCustomersParamsSchema
      .extend({ per_page: perPageSchema.default(PER_PAGE).optional() })
      .parse(search),
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(customersQueryOptions(deps));
  },
  component: CustomersPage
});
