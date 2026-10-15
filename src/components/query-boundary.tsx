import {
  onlineManager,
  useQueryErrorResetBoundary
} from '@tanstack/react-query';
import { type ReactNode, Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { describeLoadError } from '@/lib/load-error';
import { cn } from '@/lib/utils';

import { ErrorState } from './error-state';

interface QueryBoundaryProps {
  children: ReactNode;
  /** Shown while the suspense queries inside resolve. */
  fallback: ReactNode;
  /** What failed to load, e.g. "Couldn't load customers". */
  title?: ReactNode;
  /** Layout for the error card — list pages center it in the viewport. */
  className?: string;
}

/** Tries again by itself once the browser is back online. */
function BoundaryError({
  error,
  title,
  className,
  onRetry
}: {
  error: unknown;
  title?: ReactNode;
  className?: string;
  onRetry: () => void;
}) {
  useEffect(
    () => onlineManager.subscribe((isOnline) => isOnline && onRetry()),
    [onRetry]
  );

  return (
    <div className={cn('flex', className)}>
      <ErrorState
        className="w-md max-w-md"
        title={title}
        message={describeLoadError(error)}
        onRetry={onRetry}
      />
    </div>
  );
}

/**
 * Suspense + error boundary for a subtree driven by suspense queries.
 *
 * `useQueryErrorResetBoundary` reads the module-level default context, which is
 * what makes Try again work: it clears the reset flag so that remounting the
 * children refetches instead of immediately re-throwing the cached error.
 * A `QueryErrorResetBoundary` provider is only needed to scope that flag to
 * part of the tree, which nothing here does.
 */
function QueryBoundary({
  children,
  fallback,
  title,
  className
}: QueryBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ error, resetErrorBoundary }) => (
          <BoundaryError
            error={error}
            title={title}
            className={className}
            onRetry={resetErrorBoundary}
          />
        )}
      >
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

export { QueryBoundary };
