import { Trans } from '@lingui/react/macro';
import { onlineManager, type UseQueryResult } from '@tanstack/react-query';
import { RefreshCwIcon } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { describeRequestError } from '@/lib/request-error';
import { cn } from '@/lib/utils';

/**
 * "Couldn't load": what failed, why in plain words, an icon for the cause and
 * Try again, which it also does by itself once the browser is back online.
 *
 * Calm on purpose: a failed load is usually a dropped connection, not an
 * emergency, so nothing is red. `inline` (the default) has no frame, for a
 * slot that already has one, such as a table's `error`; `card` stands on its
 * own.
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
  const { message, icon: Icon } = describeRequestError(error);

  return (
    <Empty
      // Announced, as it replaces what the user was waiting for
      role="alert"
      className={cn(
        'w-full gap-5',
        'animate-in duration-300 fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none',
        variant === 'inline'
          ? 'border-0 bg-transparent p-4 md:p-6'
          : 'min-h-72 border-solid bg-card md:p-10',
        className
      )}
    >
      <EmptyHeader className="gap-1.5">
        {/* A framed tile; in the dark a shade lighter than the card, like the
            button under it, so it stands out a little without a shadow */}
        <EmptyMedia className="mb-2 size-11 rounded-lg border text-muted-foreground dark:border-input dark:bg-input/30">
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        </EmptyMedia>
        {/* Its own colour: a table cell around it may set a muted one */}
        <EmptyTitle className="text-base font-semibold tracking-normal text-foreground">
          {title ?? <Trans>Something went wrong</Trans>}
        </EmptyTitle>
        <EmptyDescription className="max-w-xs">{message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
        >
          <RefreshCwIcon className={cn(isRetrying && 'animate-spin')} />
          <Trans>Try again</Trans>
        </Button>
      </EmptyContent>
    </Empty>
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
