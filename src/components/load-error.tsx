import { onlineManager } from '@tanstack/react-query';
import { type ReactNode, useEffect } from 'react';

import { describeLoadError, loadErrorIcon } from '@/lib/load-error';

import { ErrorState } from './error-state';

/**
 * What a list shows when its load failed: what failed, why in plain words, an
 * icon for the cause and Try again, which it also does by itself once the
 * browser is back online. `inline` (the default) fits a table's error slot —
 * `<DataGrid error>` or a table's `error` prop.
 */
export function LoadErrorState({
  error,
  title,
  onRetry,
  isRetrying,
  variant = 'inline',
  className
}: {
  error: unknown;
  /** What failed to load, e.g. "Couldn't load rooms". */
  title?: ReactNode;
  onRetry: () => void;
  isRetrying?: boolean;
  variant?: 'card' | 'inline';
  className?: string;
}) {
  useEffect(
    () => onlineManager.subscribe((isOnline) => isOnline && onRetry()),
    [onRetry]
  );

  return (
    <ErrorState
      variant={variant}
      className={className}
      title={title}
      message={describeLoadError(error)}
      icon={loadErrorIcon(error)}
      onRetry={onRetry}
      isRetrying={isRetrying}
    />
  );
}

/**
 * The error a list should show in place of its rows: one that left it with
 * nothing for the current filters. A refresh that failed over rows already
 * shown is not one — those rows stay, and a toast says they are old.
 */
export function listLoadError(query: {
  isError: boolean;
  error: unknown;
  data: unknown;
  isPlaceholderData: boolean;
}): unknown {
  return query.isError && (query.data === undefined || query.isPlaceholderData)
    ? query.error
    : undefined;
}
