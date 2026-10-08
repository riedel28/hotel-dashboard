import { Trans, useLingui } from '@lingui/react/macro';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router';
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  useTable
} from '@tanstack/react-table';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { customerLabel } from 'shared/types/customers';
import type {
  Property,
  PropertySortableColumn,
  PropertyStage
} from 'shared/types/properties';
import { fetchPropertiesParamsSchema } from 'shared/types/properties';

import { propertiesQueryOptions } from '@/api/properties';
import { QueryBoundary } from '@/components/query-boundary';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { CountryFlag } from '@/components/ui/country-flag';
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
import { getCountryName } from '@/lib/countries';
import { cn } from '@/lib/utils';

import { AddPropertyModal } from './-components/add-property-modal';
import { DeletePropertyDialog } from './-components/delete-property-dialog';
import { PropertiesFilters } from './-components/properties-filters';
import { PropertyClearFilters } from './-components/property-clear-filters';
import { PropertyCountryFilter } from './-components/property-country-filter';
import { PropertySearch } from './-components/property-search';
import { PropertyStageFilter } from './-components/property-stage-filter';

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
                <Trans>Edit Property</Trans>
              </RouterLink>
            )}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive-soft"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            <Trans>Delete Property</Trans>
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
  pageSize = 10,
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
              <div className="truncate font-medium" title={name}>
                {name}
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
              className="line-clamp-1 underline-offset-4 hover:underline"
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
        id: 'actions',
        header: () => null,
        cell: ({ row }) => (
          <div className="flex justify-center">
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
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}

function PropertiesContent() {
  const { page, per_page, q, stage, country_code, sort_by, sort_order } =
    Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const propertiesQuery = useSuspenseQuery(
    propertiesQueryOptions({
      page,
      per_page,
      q,
      stage,
      country_code,
      sort_by,
      sort_order
    })
  );

  const sorting: SortingState = sort_by
    ? [{ id: sort_by, desc: sort_order === 'desc' }]
    : [];

  const hasActiveFilters = Boolean(q || stage?.length || country_code);

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
        per_page: per_page ?? 10
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
            pageSize: per_page ?? 10
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
      <PropertiesFilters>
        <PropertySearch value={q} onChange={handleSearchChange} />
        <PropertyStageFilter value={stage ?? []} onChange={handleStageChange} />
        <PropertyCountryFilter
          value={country_code}
          onChange={handleCountryChange}
        />
        <PropertyClearFilters
          hasActiveFilters={hasActiveFilters}
          onClear={handleClearFilters}
        />
        <DataGridRefreshButton
          isRefreshing={propertiesQuery.isFetching}
          onRefresh={handleRefresh}
        />
      </PropertiesFilters>
      <PropertiesTable
        data={propertiesQuery.data.index}
        pageIndex={(page ?? 1) - 1}
        pageSize={per_page ?? 10}
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

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <Trans>Properties</Trans>
        </h1>
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
            pageSize={10}
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
  validateSearch: (search) => fetchPropertiesParamsSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(propertiesQueryOptions(deps));
  },
  component: PropertiesPage
});
