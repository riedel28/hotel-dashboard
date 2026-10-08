/** One page of a list held in memory. */
export interface Page<T> {
  rows: T[];
  /** The requested page, or the last one when the request was out of range. */
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  /** How many rows there are across all pages. */
  totalCount: number;
}

export function paginate<T>(
  rows: T[],
  pageIndex: number,
  pageSize: number
): Page<T> {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const index = Math.min(pageIndex, pageCount - 1);
  return {
    rows: rows.slice(index * pageSize, (index + 1) * pageSize),
    pageIndex: index,
    pageSize,
    pageCount,
    totalCount: rows.length
  };
}
