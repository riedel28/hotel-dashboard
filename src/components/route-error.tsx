import { Trans } from '@lingui/react/macro';
import {
  onlineManager,
  useQueryErrorResetBoundary
} from '@tanstack/react-query';
import { type ErrorComponentProps, useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';

import { describeLoadError, loadErrorIcon } from '@/lib/load-error';
import { cn } from '@/lib/utils';

import { ErrorState } from './error-state';

/**
 * Shown in place of a route whose loader or render failed, inside the layouts
 * above it, so the sidebar and header stay usable.
 *
 * Retrying has to run the loaders again: `reset` alone only re-renders the
 * route, which throws the same error. Clearing the query reset flag first lets
 * the suspense queries inside refetch instead of re-throwing their cached
 * error.
 */
function RouteError({
  error,
  className
}: Pick<ErrorComponentProps, 'error'> & { className?: string }) {
  const router = useRouter();
  const { reset } = useQueryErrorResetBoundary();
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(() => {
    reset();
    setIsRetrying(true);
    void router.invalidate().finally(() => setIsRetrying(false));
  }, [reset, router]);

  useEffect(
    () => onlineManager.subscribe((isOnline) => isOnline && retry()),
    [retry]
  );

  return (
    <div
      className={cn('flex min-h-[60vh] items-center justify-center', className)}
    >
      <ErrorState
        // No table to stand in for: a card of its own
        className="max-w-lg flex-none"
        title={<Trans>Couldn't load this page</Trans>}
        message={describeLoadError(error)}
        icon={loadErrorIcon(error)}
        onRetry={retry}
        isRetrying={isRetrying}
      />
    </div>
  );
}

export { RouteError };
