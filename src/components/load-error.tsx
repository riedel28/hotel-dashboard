import { Trans } from '@lingui/react/macro';
import { RefreshCwIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';

/** In place of a list that failed to load, with a way to try again. */
export function LoadError({
  message,
  fallbackMessage,
  isRetrying,
  onRetry
}: {
  message: string;
  /** Shown when the error has no message of its own. */
  fallbackMessage: ReactNode;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Empty variant="destructive" className="w-md max-w-md">
        <EmptyHeader>
          <EmptyTitle>
            <Trans>Something went wrong</Trans>
          </EmptyTitle>
          <EmptyDescription>{message || fallbackMessage}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {/* The one action here, so it says what it does */}
          <Button variant="destructive" onClick={onRetry} disabled={isRetrying}>
            <RefreshCwIcon className={cn(isRetrying && 'animate-spin')} />
            <Trans>Refresh</Trans>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
