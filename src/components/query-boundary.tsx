import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { type ReactNode, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { cn } from '@/lib/utils';

import { ErrorState } from './error-state';

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
            <ErrorState
              className="w-md max-w-md"
              message={
                (error instanceof Error ? error.message : null) || message
              }
              onRetry={resetErrorBoundary}
            />
          </div>
        )}
      >
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

export { QueryBoundary };
