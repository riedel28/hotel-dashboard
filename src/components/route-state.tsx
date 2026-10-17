import { Trans } from '@lingui/react/macro';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import {
  type ErrorComponentProps,
  useNavigate,
  useRouter
} from '@tanstack/react-router';
import { SearchIcon } from 'lucide-react';
import { type ReactNode, useCallback, useState } from 'react';

import { StateMessage } from '@/components/state-message';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { LoadErrorState } from './load-error';

/**
 * Where a route's state card stands in for its page: by default inside the
 * layouts above it, so the sidebar and header stay usable; `fullScreen` when
 * there is no layout left to keep.
 */
function RouteFrame({
  fullScreen,
  children
}: {
  fullScreen: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullScreen ? 'min-h-screen p-4' : 'min-h-[60vh]'
      )}
    >
      {children}
    </div>
  );
}

// No table to stand in for: a card of its own
const routeCard = 'max-w-lg flex-none';

/**
 * Shown in place of a route whose loader or render failed.
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
    <RouteFrame fullScreen={fullScreen}>
      <LoadErrorState
        variant="card"
        className={routeCard}
        error={error}
        title={<Trans>Couldn't load this page</Trans>}
        onRetry={retry}
        isRetrying={isRetrying}
      />
    </RouteFrame>
  );
}

/** The app's 404: a way back and a way to the start page. */
function NotFound({ fullScreen = false }: { fullScreen?: boolean }) {
  const router = useRouter();
  const navigate = useNavigate();

  return (
    <RouteFrame fullScreen={fullScreen}>
      <StateMessage
        variant="card"
        className={routeCard}
        icon={SearchIcon}
        title={<Trans>Page not found</Trans>}
        description={
          <Trans>Sorry, we couldn't find the page you're looking for.</Trans>
        }
      >
        <Button variant="outline" onClick={() => router.history.back()}>
          <Trans>Go back</Trans>
        </Button>
        <Button onClick={() => void navigate({ to: '/' })}>
          <Trans>Go to Start</Trans>
        </Button>
      </StateMessage>
    </RouteFrame>
  );
}

/** For a route with no layout above it to keep. */
function FullScreenRouteError({ error }: Pick<ErrorComponentProps, 'error'>) {
  return <RouteError error={error} fullScreen />;
}

/** For a path no layout matches. */
function FullScreenNotFound() {
  return <NotFound fullScreen />;
}

export { FullScreenNotFound, FullScreenRouteError, NotFound, RouteError };
