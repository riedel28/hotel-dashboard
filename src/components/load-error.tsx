import { Trans } from '@lingui/react/macro';
import { onlineManager, type UseQueryResult } from '@tanstack/react-query';
import { RefreshCwIcon } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';

import { StateMessage } from '@/components/state-message';
import { Button } from '@/components/ui/button';
import { describeRequestError } from '@/lib/request-error';
import { cn } from '@/lib/utils';

/**
 * "Couldn't load": what failed, why in plain words, an icon for the cause and
 * Try again, which it also does by itself once the browser is back online.
 *
 * Calm on purpose: a failed load is usually a dropped connection, not an
 * emergency, so nothing is red. `variant` as in `StateMessage`.
 */
export function LoadErrorState({
  error,
  title,
  onRetry,
  isRetrying = false,
  variant = 'inline',
  className
}: {
  error: unknown;
  /** What failed to load, e.g. "Couldn't load rooms". */
  title?: ReactNode;
  onRetry: () => void;
  /** Disables the button and spins its icon while a retry is in flight. */
  isRetrying?: boolean;
  variant?: 'card' | 'inline';
  className?: string;
}) {
  useEffect(
    () => onlineManager.subscribe((isOnline) => isOnline && onRetry()),
    [onRetry]
  );
  const { message, icon } = describeRequestError(error);

  return (
    <StateMessage
      // Announced, as it replaces what the user was waiting for
      role="alert"
      variant={variant}
      className={className}
      icon={icon}
      title={title ?? <Trans>Something went wrong</Trans>}
      description={message}
    >
      <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
        <RefreshCwIcon className={cn(isRetrying && 'animate-spin')} />
        <Trans>Try again</Trans>
      </Button>
    </StateMessage>
  );
}

/**
 * A list's error, for its table's `error`, when its load left nothing to
 * show. A refresh that failed over rows already shown (`isRefetchError`) is
 * not one: those rows stay, and a toast says they are old.
 */
export function tableLoadError(
  query: Pick<
    UseQueryResult,
    'isLoadingError' | 'error' | 'isFetching' | 'refetch'
  >,
  title: ReactNode
): ReactNode {
  if (!query.isLoadingError) return undefined;
  return (
    <LoadErrorState
      error={query.error}
      title={title}
      isRetrying={query.isFetching}
      onRetry={() => void query.refetch()}
    />
  );
}
