import { Trans } from '@lingui/react/macro';
import { RefreshCwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

interface ReservationRefreshProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function ReservationRefresh({
  isRefreshing,
  onRefresh
}: ReservationRefreshProps) {
  return (
    <Button
      variant="outline"
      onClick={onRefresh}
      disabled={isRefreshing}
      className="w-full sm:w-auto sm:ml-auto"
    >
      <RefreshCwIcon
        className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')}
      />
      <Trans>Refresh</Trans>
    </Button>
  );
}
