import { Trans, useLingui } from '@lingui/react/macro';
import {
  QueryErrorResetBoundary,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { type PaginationState, type SortingState } from '@tanstack/react-table';
import { RefreshCwIcon } from 'lucide-react';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { fetchRoomsParamsSchema, roomsQueryOptions } from '@/api/rooms';

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

import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn } from '@/lib/utils';

import { AddRoomModal } from './-components/add-room-modal';
import { RoomClearFilters } from './-components/room-clear-filters';
import { RoomRefresh } from './-components/room-refresh';
import { RoomSearch } from './-components/room-search';
import { RoomStatusFilter } from './-components/room-status-filter';
import { RoomsFilters } from './-components/rooms-filters';
import RoomsTable from './-components/rooms-table/rooms-table';

function RoomsPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Rooms`);

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
              <Trans>Rooms</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">
          <Trans>Rooms</Trans>
        </h1>
        <AddRoomModal />
      </div>

      <Suspense
        fallback={
          <RoomsTable
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
                        <Trans>An error occurred while fetching rooms</Trans>
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
              <RoomsContent />
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </Suspense>
    </div>
  );
}

function RoomsContent() {
  const { page, per_page, status, q, sort_by, sort_order } = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const roomsQuery = useSuspenseQuery(
    roomsQueryOptions({
      page,
      per_page,
      status,
      q,
      sort_by,
      sort_order
    })
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: roomsQueryOptions({
        page,
        per_page,
        status,
        q,
        sort_by,
        sort_order
      }).queryKey
    });
  };

  const handleStatusChange = (newStatus: string | null) => {
    if (!newStatus) return;
    navigate({
      to: '/rooms',
      search: (prev) => ({
        ...prev,
        page: 1,
        status:
          newStatus === 'all'
            ? undefined
            : (newStatus as
                | 'available'
                | 'occupied'
                | 'maintenance'
                | 'out_of_order')
      })
    });
  };

  const handleSearchChange = (searchTerm: string) => {
    navigate({
      to: '/rooms',
      search: (prev) => ({
        ...prev,
        page: 1,
        q: searchTerm || undefined
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
      to: '/rooms',
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
              : [{ id: 'name', desc: false }]
          )
        : updaterOrValue;

    // Convert TanStack Table SortingState to URL params
    const firstSort = sorting[0];
    if (firstSort) {
      navigate({
        to: '/rooms',
        search: (prev) => ({
          ...prev,
          page: 1, // Reset to first page when sorting changes
          sort_by: firstSort.id as
            | 'name'
            | 'room_number'
            | 'room_type'
            | 'status',
          sort_order: firstSort.desc ? ('desc' as const) : ('asc' as const)
        })
      });
    } else {
      // Clear sorting - use default
      navigate({
        to: '/rooms',
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
      to: '/rooms',
      search: {
        page: 1,
        per_page: per_page,
        status: undefined,
        q: undefined
      }
    });
  };

  // Convert URL params to TanStack Table SortingState
  const sorting: SortingState = sort_by
    ? [{ id: sort_by, desc: sort_order === 'desc' }]
    : [{ id: 'name', desc: false }];

  const hasActiveFilters = Boolean(q || status);

  return (
    <div className="space-y-2.5">
      <RoomsFilters>
        <RoomSearch value={q} onChange={handleSearchChange} />
        <RoomStatusFilter
          value={status ? status : 'all'}
          onChange={handleStatusChange}
        />
        <RoomClearFilters
          hasActiveFilters={hasActiveFilters}
          onClear={handleClearFilters}
        />
        <RoomRefresh
          isRefreshing={roomsQuery.isFetching}
          onRefresh={handleRefresh}
        />
      </RoomsFilters>

      <div
        className={cn(
          'opacity-100 transition-opacity duration-300 ease-in-out',
          {
            'opacity-70': roomsQuery.isFetching
          }
        )}
      >
        <RoomsTable
          data={roomsQuery.data.index}
          pageIndex={(page ?? 1) - 1}
          pageSize={per_page ?? 10}
          totalCount={roomsQuery.data.total}
          pageCount={roomsQuery.data.page_count}
          onPaginationChange={handlePaginationChange}
          sorting={sorting}
          onSortingChange={handleSortingChange}
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_dashboard-layout/(user-view)/rooms/')({
  validateSearch: (search) => fetchRoomsParamsSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(roomsQueryOptions(deps));
  },
  component: RoomsPage
});
