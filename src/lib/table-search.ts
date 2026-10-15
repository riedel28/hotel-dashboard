import {
  functionalUpdate,
  type PaginationState,
  type SortingState,
  type Updater
} from '@tanstack/react-table';

// Server-paged lists keep paging and sorting in their search params; these
// translate between those params and the table's own state.

export function toPagination(search: {
  page: number;
  per_page: number;
}): PaginationState {
  return { pageIndex: search.page - 1, pageSize: search.per_page };
}

export function fromPagination(
  updater: Updater<PaginationState>,
  current: PaginationState
) {
  const next = functionalUpdate(updater, current);
  return { page: next.pageIndex + 1, per_page: next.pageSize };
}

export function toSorting(search: {
  sort_by: string;
  sort_order: 'asc' | 'desc';
}): SortingState {
  return [{ id: search.sort_by, desc: search.sort_order === 'desc' }];
}

/**
 * The table's new sorting as search params. `parseColumn` maps the column id
 * to one the API can sort by, falling back to its default.
 */
export function fromSorting<TColumn extends string>(
  updater: Updater<SortingState>,
  current: SortingState,
  parseColumn: (id: string | undefined) => TColumn
) {
  const [first] = functionalUpdate(updater, current);
  return {
    sort_by: parseColumn(first?.id),
    sort_order: first?.desc === false ? ('asc' as const) : ('desc' as const)
  };
}

/** Search params that clear the given filters: each key set to undefined. */
export function clearedParams<TKey extends string>(
  keys: readonly TKey[]
): Record<TKey, undefined> {
  return Object.fromEntries(keys.map((key) => [key, undefined])) as Record<
    TKey,
    undefined
  >;
}
