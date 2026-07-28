import { Trans } from '@lingui/react/macro';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { RefreshCwIcon } from 'lucide-react';
import { type ReactNode, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

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
import { StatusDisc } from './ui/status-disc';

interface QueryBoundaryProps {
  children: ReactNode;
  /** Shown while the suspense queries inside resolve. */
  fallback: ReactNode;
  /** Shown when the error carries no message of its own. */
  message?: ReactNode;
  /** Layout for the error card — list pages center it in the viewport. */
  className?: string;
}

/**
 * Suspense + error boundary for a subtree driven by suspense queries.
 *
 * `useQueryErrorResetBoundary` reads the module-level default context, which is
 * what makes Refresh work: it clears the reset flag so that remounting the
 * children refetches instead of immediately re-throwing the cached error.
 * A `QueryErrorResetBoundary` provider is only needed to scope that flag to
 * part of the tree, which nothing here does.
 */
function QueryBoundary({
  children,
  fallback,
  message,
  className
}: QueryBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div className={cn('flex', className)}>
            <Empty variant="destructive" className="w-md max-w-md">
              <EmptyHeader>
                <EmptyMedia variant="destructive">
                  <StatusDisc status="error" variant="soft" size="lg" />
                </EmptyMedia>
                <EmptyTitle>
                  <Trans>Something went wrong</Trans>
                </EmptyTitle>
                <EmptyDescription>
                  {(error instanceof Error ? error.message : null) ||
                    message || <Trans>An unexpected error occurred</Trans>}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="destructive" onClick={resetErrorBoundary}>
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                  <Trans>Refresh</Trans>
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        )}
      >
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

export { QueryBoundary };
