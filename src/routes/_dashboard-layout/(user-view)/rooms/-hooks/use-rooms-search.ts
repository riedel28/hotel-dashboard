import { getRouteApi } from '@tanstack/react-router';
import { useCallback } from 'react';
import type { FetchRoomsParams, RoomStatus } from 'shared/types/rooms';

const routeApi = getRouteApi('/_dashboard-layout/(user-view)/rooms/');

export interface RoomFilters {
  q?: string;
  status?: RoomStatus;
  room_type?: string[];
  floor?: number[];
}

export type RoomSortColumn = NonNullable<FetchRoomsParams['sort_by']>;

/**
 * Everything the rooms page keeps in the URL: the filters, the sorting, the
 * page and the room open in the form, with the navigations that write them.
 * Filters, sorting and paging replace the history entry; opening the form
 * pushes one, so Back closes it.
 */
export function useRoomsSearch() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const { q, status, room_type, floor, sort_by, sort_order, page, per_page } =
    search;

  // Stable, so the table's columns (which close over it) are too
  const openForm = useCallback(
    (target: number | 'new') =>
      navigate({ search: (prev) => ({ ...prev, edit: target }) }),
    [navigate]
  );

  const params: FetchRoomsParams = {
    q,
    status,
    room_type,
    floor,
    sort_by,
    sort_order,
    page,
    per_page
  };

  return {
    params,
    filters: { q, status, room_type, floor } satisfies RoomFilters,
    hasActiveFilters: Boolean(
      q || status || room_type?.length || floor?.length
    ),
    setFilters: (next: RoomFilters) =>
      navigate({
        search: (prev) => ({ ...prev, ...next, page: undefined }),
        replace: true
      }),
    clearFilters: () =>
      navigate({
        search: (prev) => ({
          sort_by: prev.sort_by,
          sort_order: prev.sort_order,
          per_page: prev.per_page
        }),
        replace: true
      }),

    sort: { by: sort_by, order: sort_order },
    setSort: (by: RoomSortColumn, order: 'asc' | 'desc') =>
      navigate({
        search: (prev) => ({
          ...prev,
          sort_by: by,
          sort_order: order,
          page: undefined
        }),
        replace: true
      }),

    pageIndex: page - 1,
    pageSize: per_page,
    setPage: (pageIndex: number, pageSize: number) =>
      navigate({
        search: (prev) => ({
          ...prev,
          page: pageIndex + 1,
          per_page: pageSize
        }),
        replace: true
      }),

    // 'new' for the empty form, a room id for editing
    formTarget: search.edit,
    openForm,
    closeForm: () =>
      navigate({ search: (prev) => ({ ...prev, edit: undefined }) })
  };
}

export type RoomsSearch = ReturnType<typeof useRoomsSearch>;
