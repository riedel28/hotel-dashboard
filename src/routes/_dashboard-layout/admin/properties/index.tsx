import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
  functionalUpdate,
  type PaginationState,
  type SortingState
} from '@tanstack/react-table';
import { BuildingIcon, ListFilterIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { perPageSchema } from 'shared/types/list-params';
import {
  fetchPropertiesParamsSchema,
  propertySortableColumnsSchema
} from 'shared/types/properties';

import { propertiesQueryOptions } from '@/api/properties';
import { ClearFiltersButton } from '@/components/clear-filters-button';
import {
  EmptyFilterResult,
  EmptyTableState
} from '@/components/empty-table-state';
import { tableLoadError } from '@/components/load-error';
import { PageHeader } from '@/components/page-header';
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
import { DataGridRefreshButton } from '@/components/ui/data-grid-refresh-button';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn } from '@/lib/utils';

import { AddPropertyModal } from './-components/add-property-modal';
import { PropertiesTable } from './-components/properties-table';
import { PropertyCountryFilter } from './-components/property-country-filter';
import { PropertyOptionsFilter } from './-components/property-options-filter';
import { PropertySearch } from './-components/property-search';
import { PropertyStageFilter } from './-components/property-stage-filter';

// Here and not in the table: validateSearch needs it, and importing the table
// for it would put the whole grid in the main bundle
const PER_PAGE = 25;

function PropertiesContent() {
  const search = Route.useSearch();
  const {
    page,
    per_page,
    q,
    stage,
    country_code,
    options,
    sort_by,
    sort_order
  } = search;
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const propertiesQuery = useQuery(propertiesQueryOptions(search));
  const { data } = propertiesQuery;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersId = useId();

  // What the folded filters hold; the search shows for itself
  const activeFilterCount = [
    country_code,
    stage?.length,
    options?.length
  ].filter(Boolean).length;
  const hasActiveFilters = Boolean(q || activeFilterCount);
  // Back to the plain list: the sort goes too
  const clearFilters = () =>
    setSearch({
      q: undefined,
      stage: undefined,
      country_code: undefined,
      options: undefined,
      sort_by: undefined,
      sort_order: undefined
    });

  // Every change but a page turn goes back to the first page
  const setSearch = (changes: Partial<typeof search>) =>
    navigate({
      to: '/admin/properties',
      search: (prev) => ({ ...prev, page: 1, ...changes })
    });

  const sorting: SortingState = sort_by
    ? [{ id: sort_by, desc: sort_order === 'desc' }]
    : [];
  const pagination: PaginationState = {
    pageIndex: (page ?? 1) - 1,
    pageSize: per_page ?? PER_PAGE
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Narrow screens: the search, a button for the other filters and
          refresh on one row, the filters folded under it. From `xl` up: one
          row that never wraps, its filters narrowing to fit. */}
      <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
        {/* As wide as the Customers search, so it doesn't jump between them */}
        <div className="min-w-0 flex-1 sm:max-w-[250px] xl:w-[250px] xl:flex-none">
          <PropertySearch
            value={q}
            onChange={(term) => setSearch({ q: term || undefined })}
          />
        </div>
        <Button
          variant="outline"
          // Greyed while any of the folded filters is set
          className={cn(
            'xl:hidden',
            activeFilterCount > 0 && 'bg-muted dark:bg-input/50'
          )}
          aria-expanded={filtersOpen}
          aria-controls={filtersId}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <ListFilterIcon />
          <Trans>Filters</Trans>
          {/* The same count badge the filters show their picks with */}
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              color="gray"
              size="xs"
              className="tabular-nums"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        <DataGridRefreshButton
          className="shrink-0 xl:order-last"
          isRefreshing={propertiesQuery.isFetching}
          onRefresh={() =>
            queryClient.invalidateQueries({ queryKey: ['properties'] })
          }
        />
        <div
          id={filtersId}
          className={cn(
            'w-full flex-col gap-2 sm:flex-row sm:items-center xl:flex xl:w-auto xl:min-w-0 xl:flex-[3]',
            filtersOpen ? 'flex' : 'hidden'
          )}
        >
          <PropertyCountryFilter
            value={country_code}
            onChange={(code) => setSearch({ country_code: code || undefined })}
          />
          <PropertyStageFilter
            value={stage ?? []}
            onChange={(stages) =>
              setSearch({ stage: stages.length > 0 ? stages : undefined })
            }
          />
          <PropertyOptionsFilter
            value={options ?? []}
            onChange={(picked) =>
              setSearch({ options: picked.length > 0 ? picked : undefined })
            }
          />
          {/* Its kept place only matters on the one-row bar */}
          <div className={cn('shrink-0', !hasActiveFilters && 'max-xl:hidden')}>
            <ClearFiltersButton
              hasActiveFilters={hasActiveFilters}
              onClear={clearFilters}
            />
          </div>
        </div>
      </div>
      <div
        className={cn('transition-opacity duration-300 ease-in-out', {
          'opacity-70': propertiesQuery.isFetching && !propertiesQuery.isLoading
        })}
      >
        <PropertiesTable
          data={data?.index ?? []}
          isLoading={propertiesQuery.isLoading}
          error={tableLoadError(
            propertiesQuery,
            <Trans>Couldn't load properties</Trans>
          )}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          totalCount={data?.total ?? 0}
          pageCount={data?.page_count ?? 0}
          onPaginationChange={(updater) => {
            const next = functionalUpdate(updater, pagination);
            setSearch({ page: next.pageIndex + 1, per_page: next.pageSize });
          }}
          sorting={sorting}
          onSortingChange={(updater) => {
            // Sorting cleared, or by a column the list cannot be ordered by:
            // back to the default order
            const [first] = functionalUpdate(updater, sorting);
            const column = propertySortableColumnsSchema.safeParse(first?.id);
            setSearch(
              column.success
                ? {
                    sort_by: column.data,
                    sort_order: first?.desc ? 'desc' : 'asc'
                  }
                : { sort_by: undefined, sort_order: undefined }
            );
          }}
          emptyMessage={
            hasActiveFilters ? (
              <EmptyFilterResult
                description={<Trans>No properties match the filters.</Trans>}
                onClearFilters={clearFilters}
              />
            ) : (
              <EmptyTableState
                icon={<BuildingIcon />}
                title={<Trans>No properties yet</Trans>}
              />
            )
          }
        />
      </div>
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

      <PageHeader
        title={<Trans>Properties</Trans>}
        description={
          <Trans>
            Manage properties, their stage and the customers that own them.
          </Trans>
        }
        actions={<AddPropertyModal />}
      />

      <PropertiesContent />
    </div>
  );
}

export const Route = createFileRoute('/_dashboard-layout/admin/properties/')({
  validateSearch: (search) =>
    fetchPropertiesParamsSchema
      .extend({ per_page: perPageSchema.default(PER_PAGE).optional() })
      .parse(search),
  loaderDeps: ({ search }) => search,
  // Waited for, but a failure isn't thrown here: it would take the whole page
  // down. The query keeps the error, and the list shows it under the filters.
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.prefetchQuery(propertiesQueryOptions(deps)),
  component: PropertiesPage
});
