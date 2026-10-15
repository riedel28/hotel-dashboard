import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { type ReactNode, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { LoadErrorState } from './load-error';

interface QueryBoundaryProps {
  children: ReactNode;
  /** Shown while the suspense queries inside resolve. */
  fallback: ReactNode;
  /** What failed to load, e.g. "Couldn't load customers". */
  title?: ReactNode;
  /** Extra classes for the error card, which fills the boundary's width. */
  className?: string;
  /**
   * Puts the error somewhere of the caller's choosing, such as in the body of
   * the table that failed to load. Gets the error, unframed, to place.
   */
  renderError?: (error: ReactNode) => ReactNode;
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
  className,
  renderError
}: QueryBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ error, resetErrorBoundary }) => {
          const state = (
            <LoadErrorState
              error={error}
              title={title}
              variant={renderError ? 'inline' : 'card'}
              className={className}
              onRetry={resetErrorBoundary}
            />
          );
          return renderError ? renderError(state) : state;
        }}
      >
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

export { QueryBoundary };
