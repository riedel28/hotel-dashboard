import * as React from 'react';

/**
 * `value`, or the last one that wasn't null. A dialog opened by a value
 * closes when it turns null; this keeps its content while it fades out
 * instead of switching to the empty state.
 */
export function useLastNonNull<T>(value: T | null) {
  const [last, setLast] = React.useState(value);
  if (value != null && value !== last) setLast(value);
  return value ?? last;
}
