import { Trans } from '@lingui/react/macro';
import { RefreshCwIcon } from 'lucide-react';
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
import { StatusDisc } from '@/components/ui/status-disc';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  /** What failed, e.g. "Failed to load products". */
  title?: ReactNode;
  /** Details, usually the error message; falls back to a generic line. */
  message?: ReactNode;
  onRetry: () => void;
  /** Disables the button and spins its icon while a retry is in flight. */
  isRetrying?: boolean;
  /**
   * `default` is sized for a whole page or section. `sm` keeps the tinted
   * card but scales everything down, for use inside an existing card.
   */
  size?: 'default' | 'sm';
  className?: string;
}

/**
 * The standard "failed to load" state. Used by `QueryBoundary` for suspense
 * queries, and directly by components that handle `isError` themselves.
 */
function ErrorState({
  title,
  message,
  onRetry,
  isRetrying = false,
  size = 'default',
  className
}: ErrorStateProps) {
  const isSmall = size === 'sm';

  return (
    <Empty
      variant="destructive"
      className={cn(isSmall && 'gap-4 p-5 md:p-5', className)}
    >
      <EmptyHeader className={cn(isSmall && 'gap-1')}>
        {/* Default (transparent) media: the disc is its own shape, and the
            tinted square variant would show its corners behind the circle. */}
        <EmptyMedia className={cn(isSmall && 'mb-1')}>
          <StatusDisc
            status="error"
            variant="soft"
            size={isSmall ? 'md' : 'lg'}
            className="rounded-lg"
          />
        </EmptyMedia>
        <EmptyTitle className={cn(isSmall && 'text-sm tracking-normal')}>
          {title ?? <Trans>Something went wrong</Trans>}
        </EmptyTitle>
        <EmptyDescription className={cn(isSmall && 'text-sm')}>
          {message || <Trans>An unexpected error occurred</Trans>}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant={isSmall ? 'outline' : 'destructive'}
          size={isSmall ? 'sm' : 'default'}
          onClick={onRetry}
          disabled={isRetrying}
        >
          <RefreshCwIcon className={cn(isRetrying && 'animate-spin')} />
          <Trans>Refresh</Trans>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export { ErrorState };
