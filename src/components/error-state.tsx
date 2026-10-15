import { Trans } from '@lingui/react/macro';
import { CircleAlertIcon, type LucideIcon, RefreshCwIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  /** What failed, e.g. "Couldn't load products". */
  title?: ReactNode;
  /** Why, in plain words; falls back to a generic line. */
  message?: ReactNode;
  /** What went wrong at a glance: no connection, a server fault, gone. */
  icon?: LucideIcon;
  onRetry: () => void;
  /** Disables the button and spins its icon while a retry is in flight. */
  isRetrying?: boolean;
  /**
   * `default` takes the place of a whole list or page. `sm` scales everything
   * down, for use inside an existing card.
   */
  size?: 'default' | 'sm';
  className?: string;
}

/**
 * The standard "failed to load" state. Used by `QueryBoundary` for suspense
 * queries, by the route error screens, and directly by components that handle
 * `isError` themselves.
 *
 * It sits in the frame of what failed to load, as wide as the table it
 * replaces, and stays calm: a failed load is usually a dropped connection, not
 * an emergency. The icon says which kind of failure it was; nothing is red.
 */
function ErrorState({
  title,
  message,
  icon: Icon = CircleAlertIcon,
  onRetry,
  isRetrying = false,
  size = 'default',
  className
}: ErrorStateProps) {
  const isSmall = size === 'sm';

  return (
    <Empty
      // Announced, as it replaces what the user was waiting for
      role="alert"
      className={cn(
        'w-full gap-5 border-solid bg-card',
        'animate-in duration-300 fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none',
        isSmall ? 'gap-4 p-5 md:p-5' : 'min-h-72 md:p-10',
        className
      )}
    >
      <EmptyHeader className="gap-1.5">
        {/* A framed tile, like the app's other icon tiles: noticeable
            without alarm */}
        <EmptyMedia
          className={cn(
            // The card's own colour: neither sunk into it nor lifted off it
            'mb-2 rounded-lg border text-muted-foreground',
            isSmall ? 'size-9' : 'size-11'
          )}
        >
          <Icon
            className={isSmall ? 'size-4.5' : 'size-5'}
            strokeWidth={1.75}
            aria-hidden
          />
        </EmptyMedia>
        <EmptyTitle
          className={cn(
            'font-semibold tracking-normal',
            isSmall ? 'text-sm' : 'text-base'
          )}
        >
          {title ?? <Trans>Something went wrong</Trans>}
        </EmptyTitle>
        <EmptyDescription className="max-w-xs">
          {message || <Trans>An unexpected error occurred</Trans>}
        </EmptyDescription>
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

export { ErrorState };
