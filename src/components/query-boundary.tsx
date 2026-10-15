import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { type ReactNode, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { LoadErrorState } from './load-error';

interface QueryBoundaryProps {
  children: ReactNode;
  /** Shown while the suspense queries inside resolve. */
  fallback: ReactNode;
  /** What failed to load, e.g. "Couldn't load the property". */
  title?: ReactNode;
}

/**
 * Suspense + error boundary for a page section driven by suspense queries,
 * such as a form. Lists don't use it: they show a failed load inside their
 * table (`tableLoadError`).
 *
 * `useQueryErrorResetBoundary` reads the module-level default context, which is
 * what makes Try again work: it clears the reset flag so that remounting the
 * children refetches instead of immediately re-throwing the cached error.
 * A `QueryErrorResetBoundary` provider is only needed to scope that flag to
 * part of the tree, which nothing here does.
 */
function QueryBoundary({ children, fallback, title }: QueryBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ error, resetErrorBoundary }) => (
          <LoadErrorState
            variant="card"
            error={error}
            title={title}
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
