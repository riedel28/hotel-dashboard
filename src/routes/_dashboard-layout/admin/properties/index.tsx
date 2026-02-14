import { Trans, useLingui } from '@lingui/react/macro';
import {
  QueryErrorResetBoundary,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router';
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable
} from '@tanstack/react-table';
import {
  MoreHorizontalIcon,
  PenSquareIcon,
  RefreshCwIcon,
  Trash2Icon
} from 'lucide-react';
import * as React from 'react';
import { Suspense, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Flag from 'react-flagkit';
import type { Property } from 'shared/types/properties';
import { fetchPropertiesParamsSchema } from 'shared/types/properties';
import { propertiesQueryOptions } from '@/api/properties';

import { StageBadge } from '@/components/stage-badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button, buttonVariants } from '@/components/ui/button';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  ErrorDisplayActions,
  ErrorDisplayError,
  ErrorDisplayMessage,
  ErrorDisplayTitle
} from '@/components/ui/error-display';
import { Skeleton } from '@/components/ui/skeleton';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn } from '@/lib/utils';

import { AddPropertyModal } from './-components/add-property-modal';
import { DeletePropertyDialog } from './-components/delete-property-dialog';
import { PropertiesFilters } from './-components/properties-filters';
import { PropertyClearFilters } from './-components/property-clear-filters';
import { PropertyCountryFilter } from './-components/property-country-filter';
import { PropertyRefresh } from './-components/property-refresh';
import { PropertySearch } from './-components/property-search';
import { PropertyStageFilter } from './-components/property-stage-filter';

function getCountryName(countryCode: string): string {
  const countryMap: Record<string, string> = {
    AT: 'Austria',
    CH: 'Switzerland',
    CZ: 'Czech Republic',
    DE: 'Germany',
    ES: 'Spain',
    US: 'United States'
  };
  return countryMap[countryCode] || countryCode;
}

function RowActions({ row }: { row: { original: Property } }) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          )}
        >
          <MoreHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">
            <Trans>Open menu</Trans>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem
            render={(props) => (
              <RouterLink
                {...props}
                to="/admin/properties/$propertyId"
                params={{ propertyId: row.original.id }}
                preload="intent"
              >
                <PenSquareIcon className="mr-2 h-4 w-4" />
                <Trans>Edit</Trans>
              </RouterLink>
            )}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            <Trans>Delete</Trans>
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

  const { t } = useLingui();

  const columns = useMemo<ColumnDef<Property>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Name`}
            visibility={true}
            column={column}
          />
        ),
        cell: (info) => {
          const name = info.getValue() as string;
          return (
            <span className="font-medium line-clamp-1" title={name}>
              {name}
            </span>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-40" />,
          headerTitle: t`Name`
        },
        size: 300,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true
      },
      {
        accessorKey: 'country_code',
        id: 'country_code',
        header: ({ column }) => (
          <DataGridColumnHeader
            title={t`Country`}
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const countryCode = row.original.country_code;
          const countryName = getCountryName(countryCode);
          return (
            <div className="flex items-center gap-2">
              <Flag
                country={countryCode}
                title={countryCode}
                className="size-3.5 rounded-sm"
                aria-label={countryCode}
              />
              <span className="text-foreground">{countryName}</span>
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className="h-6 w-24" />,
          headerTitle: t`Country`
        },
        size: 150,
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
    [t]
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const [, setInternalSorting] = useState<SortingState>([]);

  const table = useReactTable({
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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

  const hasActiveFilters = Boolean(
    q || (stage && stage !== 'all') || (country_code && country_code !== 'all')
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

  const handleStageChange = (value: string | null) => {
    navigate({
      to: '/admin/properties',
      search: (prev) => ({
        ...prev,
        stage:
          !value || value === 'all'
            ? undefined
            : (value as 'demo' | 'production' | 'staging' | 'template'),
        page: 1
      })
    });
  };

  const handleCountryChange = (value: string | null) => {
    navigate({
      to: '/admin/properties',
      search: (prev) => ({
        ...prev,
        country_code:
          !value || value === 'all'
            ? undefined
            : (value as 'AT' | 'CH' | 'CZ' | 'DE' | 'ES' | 'US'),
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
          sort_by: firstSort.id as 'name' | 'country_code' | 'stage',
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
        <PropertyStageFilter value={stage} onChange={handleStageChange} />
        <PropertyCountryFilter
          value={country_code}
          onChange={handleCountryChange}
        />
        <PropertyClearFilters
          hasActiveFilters={hasActiveFilters}
          onClear={handleClearFilters}
        />
        <PropertyRefresh
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
        <h1 className="text-2xl font-bold">
          <Trans>Properties</Trans>
        </h1>
        <AddPropertyModal />
      </div>

      <Suspense
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
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ error, resetErrorBoundary }) => (
                <div className="flex min-h-[60vh] items-center justify-center">
                  <ErrorDisplayError className="w-md max-w-md">
                    <ErrorDisplayTitle>
                      <Trans>Something went wrong</Trans>
                    </ErrorDisplayTitle>
                    <ErrorDisplayMessage>
                      {(error instanceof Error ? error.message : null) || (
                        <Trans>
                          An error occurred while fetching properties
                        </Trans>
                      )}
                    </ErrorDisplayMessage>
                    <ErrorDisplayActions>
                      <Button
                        variant="destructive"
                        onClick={resetErrorBoundary}
                      >
                        <RefreshCwIcon className="mr-2 h-4 w-4" />
                        <Trans>Refresh</Trans>
                      </Button>
                    </ErrorDisplayActions>
                  </ErrorDisplayError>
                </div>
              )}
            >
              <PropertiesContent />
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </Suspense>
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
