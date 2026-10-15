import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { type Query, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { isSessionError } from '@/api/client';

import { isTransientError } from './request-error';

/**
 * A refresh that failed over data already on screen would otherwise go
 * unnoticed: the old rows stay, nothing says they are old. One toast however
 * many queries failed together. A first load that fails isn't toasted: it
 * shows its own error in place (`tableLoadError`).
 */
function toastFailedRefresh(
  error: unknown,
  query: Query<unknown, unknown>,
  cache: QueryCache
) {
  if (query.state.data === undefined || isSessionError(error)) return;
  const time = i18n.date(new Date(query.state.dataUpdatedAt), {
    timeStyle: 'short'
  });
  toast.error(t`Couldn't refresh`, {
    id: 'refresh-failed',
    description: t`Showing data from ${time}.`,
    action: {
      label: t`Try again`,
      onClick: () => {
        for (const failed of cache.findAll({
          type: 'active',
          predicate: (q) => q.state.status === 'error'
        })) {
          void failed.fetch();
        }
      }
    }
  });
}

/** The app's query client: its retry policy and how it reports failures. */
export function createQueryClient() {
  const queryCache = new QueryCache({
    onError: (error, query) => toastFailedRefresh(error, query, queryCache)
  });

  return new QueryClient({
    queryCache,
    defaultOptions: {
      queries: {
        // A dropped connection or a failing server may pass on a second try;
        // a refused request (4xx) won't, so it shows at once
        retry: (failureCount, error) =>
          failureCount < 2 && isTransientError(error),
        staleTime: 1000 * 60 * 5 // 5 minutes
      }
    }
  });
}
