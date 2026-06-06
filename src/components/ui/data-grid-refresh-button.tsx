import { Trans } from '@lingui/react/macro';
import { RefreshCwIcon } from 'lucide-react';

import { Button, type ButtonProps } from '@/components/ui/button';

import { cn } from '@/lib/utils';

interface DataGridRefreshButtonProps extends Omit<
  ButtonProps,
  'children' | 'disabled' | 'onClick'
> {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function DataGridRefreshButton({
  isRefreshing,
  onRefresh,
  className,
  ...props
}: DataGridRefreshButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onRefresh}
      disabled={isRefreshing}
      className={cn('w-full sm:ml-auto sm:w-auto', className)}
      {...props}
    >
      <RefreshCwIcon
        className={cn('mr-1 h-4 w-4', isRefreshing && 'animate-spin')}
      />
      <Trans>Refresh</Trans>
    </Button>
  );
}
