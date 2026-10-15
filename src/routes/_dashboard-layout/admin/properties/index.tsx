import { Trans, useLingui } from '@lingui/react/macro';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  Link as RouterLink,
  useNavigate
} from '@tanstack/react-router';
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  useTable
} from '@tanstack/react-table';
import { ListFilterIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';
import { useId, useMemo, useState } from 'react';
import { customerLabel } from 'shared/types/customers';
import { perPageSchema } from 'shared/types/list-params';
import type {
  Property,
  PropertyOption,
  PropertySortableColumn,
  PropertyStage
} from 'shared/types/properties';
import { fetchPropertiesParamsSchema } from 'shared/types/properties';

import { propertiesQueryOptions } from '@/api/properties';
import { ClearFiltersButton } from '@/components/clear-filters-button';
import { CountryName } from '@/components/country-name';
import { QueryBoundary } from '@/components/query-boundary';
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
  DataGrid,
  DataGridContainer,
  type DataGridFeatures,
  dataGridFeatures
} from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridRefreshButton } from '@/components/ui/data-grid-refresh-button';
import { DataGridRowActions } from '@/components/ui/data-grid-row-actions';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { StageBadge } from '@/components/ui/stage-badge';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn } from '@/lib/utils';

import { AddPropertyModal } from './-components/add-property-modal';
import { DeletePropertyDialog } from './-components/delete-property-dialog';
import { PropertyCountryFilter } from './-components/property-country-filter';
import { PropertyOptionsCell } from './-components/property-options-cell';
import { PropertyOptionsFilter } from './-components/property-options-filter';
import { PropertySearch } from './-components/property-search';
import { PropertyStageFilter } from './-components/property-stage-filter';

// A page holds every property most installations have
const PER_PAGE = 25;

function RowActions({ row }: { row: { original: Property } }) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DataGridRowActions />
        <DropdownMenuContent align="end" className="w-auto min-w-0">
          <DropdownMenuItem
            render={(props) => (
              <RouterLink
                {...props}
                to="/admin/properties/$propertyId"
                params={{ propertyId: row.original.id }}
                preload="intent"
              >
                <PencilIcon className="mr-2 h-4 w-4" />
                <Trans>Edit property</Trans>
              </RouterLink>
            )}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive-soft"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            <Trans>Delete property</Trans>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeletePropertyDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        propertyName={row.original.name}
        propertyId={row.original.id}
      />
    </>
  );
}

/**
 * Phones get the rows as cards: name, stage, country and customer, the whole
 * card opening the property.
 */
function PropertyCards({
  data,
  isLoading,
  emptyMessage,
  className
}: {
  data: Property[];
  isLoading: boolean;
  emptyMessage?: React.ReactNode;
  className?: string;
}) {
  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[0, 1, 2, 3, 4].map((key) => (
          <Skeleton key={key} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border px-4 py-8 text-center text-sm text-muted-foreground',
          className
        )}
      >
        {emptyMessage || <Trans>No data available</Trans>}
      </div>
    );
  }

  return (
    <ul className={cn('divide-y rounded-lg border', className)}>
      {data.map((property) => (
        <li
          key={property.id}
          className="relative flex items-start gap-3 p-4 hover:bg-muted/40"
        >
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex min-w-0 items-center gap-2">
              <RouterLink
                to="/admin/properties/$propertyId"
                params={{ propertyId: property.id }}
                preload="intent"
                // Stretched over the card, so all of it opens the property
                className="truncate font-medium after:absolute after:inset-0"
              >
                {property.name}
              </RouterLink>
              <StageBadge stage={property.stage} size="sm" />
            </div>
            <CountryName
              code={property.country_code}
              className="text-xs text-muted-foreground"
            />
            {property.customer && (
              <div className="truncate text-sm text-muted-foreground">
                {customerLabel(property.customer)}
              </div>
            )}
          </div>
          {/* Above the stretched link */}
          <div className="relative">
            <RowActions row={{ original: property }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

interface PropertiesTableProps {
  /** Shown in place of the rows when there are none. */
  emptyMessage?: React.ReactNode;
  data: Property[];
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

function PropertiesTable({
  emptyMessage,
  data,
  isLoading = false,
  pageIndex = 0,
  pageSize = PER_PAGE,
  totalCount = 0,
  pageCount = 0,
  onPaginationChange,
  sorting,
  onSortingChange
}: PropertiesTableProps) {
  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize]
  );

  const { i18n, t } = useLingui();
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<DataGridFeatures, Property>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Property`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const { name, country_code } = row.original;
          return (
            <div className="min-w-0">
              {/* The keyboard way into the property; a click anywhere on the
                  row opens it too */}
              <RouterLink
                to="/admin/properties/$propertyId"
                params={{ propertyId: row.original.id }}
                preload="intent"
                onClick={(event) => event.stopPropagation()}
                className="block w-fit max-w-full truncate font-medium underline-offset-4 hover:underline"
                title={name}
              >
                {name}
              </RouterLink>
              <CountryName
                code={country_code}
                className="text-xs text-muted-foreground"
              />
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-8 w-40" />,
          headerTitle: t`Property`
        },
        size: 300,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true
      },
      {
        id: 'customer',
        accessorFn: (property) =>
          property.customer ? customerLabel(property.customer) : '',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Customer`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const customer = row.original.customer;
          if (!customer) {
            return <span className="text-muted-foreground">—</span>;
          }
          const label = customerLabel(customer);
          return (
            <RouterLink
              to="/admin/customers/$customerId"
              params={{ customerId: customer.id }}
              preload="intent"
              onClick={(event) => event.stopPropagation()}
              // As wide as its text: the rest of the cell is the row
              className="block w-fit max-w-full truncate text-link underline-offset-4 hover:underline"
              title={label}
            >
              {label}
            </RouterLink>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-32" />,
          headerTitle: t`Customer`
        },
        size: 220,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true
      },
      {
        accessorKey: 'stage',
        id: 'stage',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Stage`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const stage = row.getValue('stage') as Property['stage'];
          return <StageBadge stage={stage} size="sm" />;
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-20" />,
          headerTitle: t`Stage`
        },
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: false
      },
      {
        accessorKey: 'options',
        id: 'options',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Solutions`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => (
          <PropertyOptionsCell options={row.original.options} />
        ),
        meta: {
          skeleton: <Skeleton className="h-6 w-48" />,
          headerTitle: t`Solutions`
        },
        size: 340,
        enableSorting: false,
        enableHiding: true,
        enableResizing: true
      },
      {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => (
          // The menu and its dialog keep their clicks from opening the row
          <div
            className="flex justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <RowActions row={row} />
          </div>
        ),
        meta: {
          skeleton: (
            <div className="flex items-center justify-center">
              <Skeleton className="h-6 w-6" />
            </div>
          )
        },
        size: 70,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false
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
    getRowId: (row: Property) => row.id,
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
      onRowClick={(property) =>
        void navigate({
          to: '/admin/properties/$propertyId',
          params: { propertyId: property.id }
        })
      }
      tableClassNames={{ edgeCell: 'px-5' }}
      tableLayout={{
        columnsPinnable: false,
        columnsMovable: false,
        columnsVisibility: false
      }}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
    >
      <div className="w-full space-y-2.5">
        <DataGridContainer className="hidden sm:block">
          <DataGridTable />
        </DataGridContainer>
        <PropertyCards
          className="sm:hidden"
          data={data}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
        />
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}

function PropertiesContent() {
  const {
    page,
    per_page,
    q,
    stage,
    country_code,
    options,
    sort_by,
    sort_order
  } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersId = useId();
  // What the folded filters hold; the search shows for itself
  const activeFilterCount = [
    country_code,
    stage?.length,
    options?.length
  ].filter(Boolean).length;
  const queryClient = useQueryClient();

  const propertiesQuery = useSuspenseQuery(
    propertiesQueryOptions({
      page,
      per_page,
      q,
      stage,
      country_code,
      options,
      sort_by,
      sort_order
    })
  );

  const sorting: SortingState = sort_by
    ? [{ id: sort_by, desc: sort_order === 'desc' }]
    : [];

  const hasActiveFilters = Boolean(
    q || stage?.length || country_code || options?.length
  );

  const handleSearchChange = (searchTerm: string) => {
    navigate({
      to: '/admin/properties',
      search: (prev) => ({
        ...prev,
        q: searchTerm || undefined,
        page: 1
      })
    });
  };

  const handleStageChange = (stages: PropertyStage[]) => {
    navigate({
      to: '/admin/properties',
      search: (prev) => ({
        ...prev,
        stage: stages.length > 0 ? stages : undefined,
        page: 1
      })
    });
  };

  const handleOptionsChange = (selected: PropertyOption[]) => {
    navigate({
      to: '/admin/properties',
      search: (prev) => ({
        ...prev,
        options: selected.length > 0 ? selected : undefined,
        page: 1
      })
    });
  };

  const handleCountryChange = (value: string | null) => {
    navigate({
      to: '/admin/properties',
      search: (prev) => ({
        ...prev,
        country_code: value || undefined,
        page: 1
      })
    });
  };

  const handleClearFilters = () => {
    navigate({
      to: '/admin/properties',
      search: {
        page: 1,
        per_page: per_page ?? PER_PAGE
      }
    });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  };

  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const newSorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting)
        : updaterOrValue;

    const firstSort = newSorting[0];
    if (firstSort) {
      navigate({
        to: '/admin/properties',
        search: (prev) => ({
          ...prev,
          page: 1,
          sort_by: firstSort.id as PropertySortableColumn,
          sort_order: firstSort.desc ? ('desc' as const) : ('asc' as const)
        })
      });
    } else {
      navigate({
        to: '/admin/properties',
        search: (prev) => ({
          ...prev,
          page: 1,
          sort_by: undefined,
          sort_order: undefined
        })
      });
    }
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
            pageSize: per_page ?? PER_PAGE
          })
        : updaterOrValue;

    navigate({
      to: '/admin/properties',
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
          'opacity-70': propertiesQuery.isFetching
        }
      )}
    >
      {/* Phones: the search, a button for the other filters and refresh on
          one row, the filters folded under it. From `sm` up: one row. */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1 sm:flex-none">
          <PropertySearch value={q} onChange={handleSearchChange} />
        </div>
        <Button
          variant="outline"
          className="sm:hidden"
          aria-expanded={filtersOpen}
          aria-controls={filtersId}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <ListFilterIcon />
          <Trans>Filters</Trans>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-xs leading-5 text-primary-foreground tabular-nums">
              {activeFilterCount}
            </span>
          )}
        </Button>
        <DataGridRefreshButton
          className="sm:order-last"
          isRefreshing={propertiesQuery.isFetching}
          onRefresh={handleRefresh}
        />
        <div
          id={filtersId}
          className={cn(
            'w-full flex-col gap-2 sm:flex sm:w-auto sm:flex-row sm:items-center',
            filtersOpen ? 'flex' : 'hidden'
          )}
        >
          <PropertyCountryFilter
            value={country_code}
            onChange={handleCountryChange}
          />
          <PropertyStageFilter
            value={stage ?? []}
            onChange={handleStageChange}
          />
          <PropertyOptionsFilter
            value={options ?? []}
            onChange={handleOptionsChange}
          />
          {/* Its kept place only matters on the one-row bar */}
          <div className={cn(!hasActiveFilters && 'max-sm:hidden')}>
            <ClearFiltersButton
              hasActiveFilters={hasActiveFilters}
              onClear={handleClearFilters}
            />
          </div>
        </div>
      </div>
      <PropertiesTable
        data={propertiesQuery.data.index}
        pageIndex={(page ?? 1) - 1}
        pageSize={per_page ?? PER_PAGE}
        totalCount={propertiesQuery.data.total}
        pageCount={propertiesQuery.data.page_count}
        onPaginationChange={handlePaginationChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        emptyMessage={
          hasActiveFilters ? (
            <Trans>No properties match the filters</Trans>
          ) : undefined
        }
      />
    </div>
  );
}

function PropertiesPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Properties`);

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
              <Trans>Properties</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">
            <Trans>Properties</Trans>
          </h1>
          <p className="text-sm text-muted-foreground">
            <Trans>
              Manage properties, their stage and the customers that own them.
            </Trans>
          </p>
        </div>
        <AddPropertyModal />
      </div>

      <QueryBoundary
        className="min-h-[60vh] items-center justify-center"
        message={<Trans>An error occurred while fetching properties</Trans>}
        fallback={
          <PropertiesTable
            data={[]}
            isLoading={true}
            pageIndex={0}
            pageSize={PER_PAGE}
            totalCount={0}
            pageCount={0}
          />
        }
      >
        <PropertiesContent />
      </QueryBoundary>
    </div>
  );
}

export const Route = createFileRoute('/_dashboard-layout/admin/properties/')({
  validateSearch: (search) =>
    fetchPropertiesParamsSchema
      .extend({ per_page: perPageSchema.default(PER_PAGE).optional() })
      .parse(search),
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(propertiesQueryOptions(deps));
  },
  component: PropertiesPage
});
