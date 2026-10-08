import { Trans, useLingui } from '@lingui/react/macro';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router';
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  useTable
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import type { Customer, CustomerSortableColumn } from 'shared/types/customers';
import { fetchCustomersParamsSchema } from 'shared/types/customers';
import { z } from 'zod';

import { customersQueryOptions } from '@/api/customers';
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
import { CountryFlag } from '@/components/ui/country-flag';
import { CountryPicker } from '@/components/ui/country-picker';
import {
  DataGrid,
  DataGridContainer,
  type DataGridFeatures,
  dataGridFeatures
} from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridRefreshButton } from '@/components/ui/data-grid-refresh-button';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { SearchInput } from '@/components/ui/search-input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { getCountryName } from '@/lib/countries';
import { cn } from '@/lib/utils';

import { PropertiesFilters } from '../properties/-components/properties-filters';
import { PropertyClearFilters } from '../properties/-components/property-clear-filters';
import { AddCustomerDrawer } from './-components/add-customer-drawer';
import { CustomerDetailsDrawer } from './-components/customer-details-drawer';

const propertyLinkClass = 'truncate underline-offset-4 hover:underline';

/** The first Property by name, and a "+N" badge that lists all of them. */
function PropertiesCell({
  properties
}: {
  properties: Customer['properties'];
}) {
  const { t } = useLingui();
  const [first, ...rest] = properties;

  if (!first) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    // Its links and the list (a portal, but still a React child of the row)
    // must not also open the Customer the row belongs to.
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className="flex min-w-0 items-center gap-2"
      onClick={(event) => event.stopPropagation()}
    >
      <RouterLink
        to="/admin/properties/$propertyId"
        params={{ propertyId: first.id }}
        className={propertyLinkClass}
        title={first.name}
      >
        {first.name}
      </RouterLink>
      {rest.length > 0 && (
        <Popover>
          <PopoverTrigger
            openOnHover
            delay={150}
            className="shrink-0 cursor-pointer rounded-md"
            aria-label={t`Show all ${properties.length} properties`}
          >
            <Badge
              variant="secondary"
              color="gray"
              size="xs"
              className="tabular-nums"
            >
              +{rest.length}
            </Badge>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto max-w-72 p-3">
            <ul className="flex flex-col gap-1.5">
              {properties.map((property) => (
                <li key={property.id} className="flex min-w-0">
                  <RouterLink
                    to="/admin/properties/$propertyId"
                    params={{ propertyId: property.id }}
                    className={propertyLinkClass}
                  >
                    {property.name}
                  </RouterLink>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

interface CustomersTableProps {
  onCustomerOpen?: (customer: Customer) => void;
  /** Shown in place of the rows when there are none. */
  emptyMessage?: React.ReactNode;
  data: Customer[];
  isLoading?: boolean;
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  pageCount?: number;
  onPaginationChange?: (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) => void;
  sorting?: SortingState;
  onSortingChange?: (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => void;
}

function CustomersTable({
  onCustomerOpen,
  emptyMessage,
  data,
  isLoading = false,
  pageIndex = 0,
  pageSize = 10,
  totalCount = 0,
  pageCount = 0,
  onPaginationChange,
  sorting,
  onSortingChange
}: CustomersTableProps) {
  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize]
  );

  const { i18n, t } = useLingui();

  const columns = useMemo<ColumnDef<DataGridFeatures, Customer>[]>(
    () => [
      {
        id: 'name',
        accessorFn: (customer) =>
          `${customer.first_name} ${customer.last_name}`,
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Customer`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row, getValue }) => {
          const name = getValue() as string;
          const company = row.original.company_name;
          return (
            <div className="min-w-0">
              {/* The click bubbles to the row, which opens the details; the
                  button is what makes that reachable from the keyboard */}
              <button
                type="button"
                className="block max-w-full cursor-pointer truncate rounded-sm text-left font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title={name}
              >
                {name}
              </button>
              {company && (
                <div
                  className="truncate text-xs text-muted-foreground"
                  title={company}
                >
                  {company}
                </div>
              )}
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-8 w-40" />,
          headerTitle: t`Customer`
        },
        size: 240,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true
      },
      {
        accessorKey: 'email',
        id: 'email',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Email`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => (
          <span className="line-clamp-1" title={row.original.email}>
            {row.original.email}
          </span>
        ),
        meta: {
          skeleton: <Skeleton className="h-6 w-40" />,
          headerTitle: t`Email`
        },
        size: 240,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        // Just where the Customer is; the street and ZIP are on its page.
        accessorKey: 'city',
        id: 'city',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Address`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const { city, country_code } = row.original;
          return (
            <div className="min-w-0">
              <div className="truncate" title={city}>
                {city}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CountryFlag
                  code={country_code}
                  title={country_code}
                  className="size-3.5 shrink-0"
                  aria-label={country_code}
                />
                <span className="truncate">
                  {getCountryName(country_code, i18n.locale)}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-8 w-36" />,
          headerTitle: t`Address`
        },
        size: 220,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'property_count',
        id: 'property_count',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Properties`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => (
          <PropertiesCell properties={row.original.properties} />
        ),
        meta: {
          skeleton: <Skeleton className="h-6 w-40" />,
          headerTitle: t`Properties`
        },
        size: 260,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      }
    ],
    [i18n.locale, t]
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const [, setInternalSorting] = useState<SortingState>([]);

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: data || [],
    pageCount,
    getRowId: (row: Customer) => row.id,
    state: {
      pagination,
      sorting,
      columnOrder
    },
    onPaginationChange,
    onSortingChange: onSortingChange ?? setInternalSorting,
    onColumnOrderChange: setColumnOrder,
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: true
  });

  return (
    <DataGrid
      table={table}
      recordCount={totalCount}
      tableClassNames={{ edgeCell: 'px-5' }}
      tableLayout={{
        columnsPinnable: false,
        columnsMovable: false,
        columnsVisibility: false
      }}
      isLoading={isLoading}
      onRowClick={onCustomerOpen}
      emptyMessage={emptyMessage}
    >
      <div className="w-full space-y-2.5">
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}

function CustomersContent() {
  const { page, per_page, q, country_code, sort_by, sort_order } =
    Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLingui();

  const customersQuery = useSuspenseQuery(
    customersQueryOptions({
      page,
      per_page,
      q,
      country_code,
      sort_by,
      sort_order
    })
  );

  const sorting: SortingState = sort_by
    ? [{ id: sort_by, desc: sort_order === 'desc' }]
    : [];

  const handleSearchChange = (searchTerm: string) => {
    navigate({
      to: '/admin/customers',
      search: (prev) => ({ ...prev, q: searchTerm || undefined, page: 1 })
    });
  };

  const handleCountryChange = (value: string | null) => {
    navigate({
      to: '/admin/customers',
      search: (prev) => ({
        ...prev,
        country_code: value || undefined,
        page: 1
      })
    });
  };

  const handleClearFilters = () => {
    navigate({
      to: '/admin/customers',
      search: { page: 1, per_page: per_page ?? 10 }
    });
  };

  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const [firstSort] =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting)
        : updaterOrValue;

    navigate({
      to: '/admin/customers',
      search: (prev) => ({
        ...prev,
        page: 1,
        sort_by: firstSort?.id as CustomerSortableColumn | undefined,
        sort_order: firstSort
          ? firstSort.desc
            ? ('desc' as const)
            : ('asc' as const)
          : undefined
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
      to: '/admin/customers',
      search: (prev) => ({
        ...prev,
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize
      })
    });
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 opacity-100 transition-opacity duration-300 ease-in-out',
        {
          'opacity-70': customersQuery.isFetching
        }
      )}
    >
      <PropertiesFilters>
        <SearchInput
          value={q || ''}
          onChange={handleSearchChange}
          placeholder={t`Search customers`}
          wrapperClassName="w-full sm:w-[250px]"
          debounceMs={500}
        />
        <CountryPicker
          value={country_code}
          onValueChange={handleCountryChange}
          placeholder={t`All countries`}
          className="w-full sm:w-45"
        />
        <PropertyClearFilters
          hasActiveFilters={Boolean(q || country_code)}
          onClear={handleClearFilters}
        />
        <DataGridRefreshButton
          isRefreshing={customersQuery.isFetching}
          onRefresh={() =>
            queryClient.invalidateQueries({ queryKey: ['customers'] })
          }
        />
      </PropertiesFilters>
      <CustomersTable
        data={customersQuery.data.index}
        pageIndex={(page ?? 1) - 1}
        pageSize={per_page ?? 10}
        totalCount={customersQuery.data.total}
        pageCount={customersQuery.data.page_count}
        onPaginationChange={handlePaginationChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        onCustomerOpen={(customer) =>
          // Pushes a history entry, so Back closes the drawer
          navigate({
            to: '/admin/customers',
            search: (prev) => ({ ...prev, customer: customer.id })
          })
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

// The list's parameters plus the Customer whose drawer is open
const customersSearchSchema = fetchCustomersParamsSchema.extend({
  customer: z.uuid().optional().catch(undefined)
});

function CustomersPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Customers`);
  const { customer: openCustomerId } = Route.useSearch();
  const navigate = Route.useNavigate();

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

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <Trans>Customers</Trans>
        </h1>
        <AddCustomerDrawer />
      </div>

      <QueryBoundary
        className="min-h-[60vh] items-center justify-center"
        message={<Trans>An error occurred while fetching customers</Trans>}
        fallback={
          <CustomersTable
            data={[]}
            isLoading={true}
            pageIndex={0}
            pageSize={10}
            totalCount={0}
            pageCount={0}
          />
        }
      >
        <CustomersContent />
      </QueryBoundary>

      <CustomerDetailsDrawer
        customerId={openCustomerId}
        onClose={() =>
          navigate({
            to: '/admin/customers',
            search: (prev) => ({ ...prev, customer: undefined })
          })
        }
      />
    </div>
  );
}

export const Route = createFileRoute('/_dashboard-layout/admin/customers/')({
  validateSearch: (search) => customersSearchSchema.parse(search),
  // The open Customer is not part of the list request
  loaderDeps: ({ search: { customer: _open, ...list } }) => list,
  loader: ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(customersQueryOptions(deps));
  },
  component: CustomersPage
});
