import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';

import { ApiError } from '@/api/client';
import { DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';

/** A details drawer's content while its item loads or could not be loaded. */
export function DrawerUnavailable({
  isLoading,
  error,
  loadingText,
  notFoundTitle,
  notFoundText
}: {
  isLoading: boolean;
  error: Error | null;
  loadingText: ReactNode;
  notFoundTitle: ReactNode;
  notFoundText: ReactNode;
}) {
  let title: ReactNode = <Trans>Something went wrong</Trans>;
  let description: ReactNode = error?.message;

  if (isLoading) {
    title = <Skeleton className="h-6 w-40" />;
    description = loadingText;
  } else if (error instanceof ApiError && error.status === 404) {
    title = notFoundTitle;
    description = notFoundText;
  }

  return (
    <DrawerHeader className="space-y-1 pr-14">
      <DrawerTitle>{title}</DrawerTitle>
      <p className="text-sm font-normal text-muted-foreground">{description}</p>
    </DrawerHeader>
  );
}
