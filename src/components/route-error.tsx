import { Trans } from '@lingui/react/macro';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { type ErrorComponentProps, useRouter } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

import { cn } from '@/lib/utils';

import { LoadErrorState } from './load-error';

/**
 * Shown in place of a route whose loader or render failed: by default inside
 * the layouts above it, so the sidebar and header stay usable; `fullScreen`
 * when there is no layout left to keep.
 *
 * Retrying has to run the loaders again: `reset` alone only re-renders the
 * route, which throws the same error. Clearing the query reset flag first lets
 * the suspense queries inside refetch instead of re-throwing their cached
 * error.
 */
function RouteError({
  error,
  fullScreen = false
}: Pick<ErrorComponentProps, 'error'> & { fullScreen?: boolean }) {
  const router = useRouter();
  const { reset } = useQueryErrorResetBoundary();
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(() => {
    reset();
    setIsRetrying(true);
    void router.invalidate().finally(() => setIsRetrying(false));
  }, [reset, router]);

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullScreen ? 'min-h-screen p-4' : 'min-h-[60vh]'
      )}
    >
      <LoadErrorState
        variant="card"
        // No table to stand in for: a card of its own
        className="max-w-lg flex-none"
        error={error}
        title={<Trans>Couldn't load this page</Trans>}
        onRetry={retry}
        isRetrying={isRetrying}
      />
    </div>
  );
}

/** For a route with no layout above it to keep. */
function FullScreenRouteError({ error }: Pick<ErrorComponentProps, 'error'>) {
  return <RouteError error={error} fullScreen />;
}

export { FullScreenRouteError, RouteError };
