import {
  onlineManager,
  useQueryErrorResetBoundary
} from '@tanstack/react-query';
import { type ReactNode, Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { describeLoadError, loadErrorIcon } from '@/lib/load-error';

import { ErrorState } from './error-state';

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

/** Tries again by itself once the browser is back online. */
function BoundaryError({
  error,
  title,
  className,
  renderError,
  onRetry
}: {
  error: unknown;
  title?: ReactNode;
  className?: string;
  renderError?: (error: ReactNode) => ReactNode;
  onRetry: () => void;
}) {
  useEffect(
    () => onlineManager.subscribe((isOnline) => isOnline && onRetry()),
    [onRetry]
  );

  const state = (
    <ErrorState
      variant={renderError ? 'inline' : 'card'}
      className={className}
      title={title}
      message={describeLoadError(error)}
      icon={loadErrorIcon(error)}
      onRetry={onRetry}
    />
  );
  return renderError ? renderError(state) : state;
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
        fallbackRender={({ error, resetErrorBoundary }) => (
          <BoundaryError
            error={error}
            title={title}
            className={className}
            renderError={renderError}
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
