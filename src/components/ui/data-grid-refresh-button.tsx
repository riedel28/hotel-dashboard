import { Trans, useLingui } from '@lingui/react/macro';
import { RefreshCwIcon } from 'lucide-react';

import { Button, type ButtonProps } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DataGridRefreshButtonProps extends Omit<
  ButtonProps,
  'children' | 'disabled' | 'onClick'
> {
  isRefreshing: boolean;
  onRefresh: () => void;
}

/**
 * Refetches a table. An icon, so the filters beside it keep their room in
 * every language; it sits at the end of its row unless told otherwise.
 */
export function DataGridRefreshButton({
  isRefreshing,
  onRefresh,
  className,
  ...props
}: DataGridRefreshButtonProps) {
  const { t } = useLingui();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            aria-label={t`Refresh`}
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn('ml-auto size-9 shrink-0 p-0', className)}
            {...props}
          />
        }
      >
        <RefreshCwIcon
          className={cn('size-4', isRefreshing && 'animate-spin')}
        />
      </TooltipTrigger>
      <TooltipContent>
        <Trans>Refresh</Trans>
      </TooltipContent>
    </Tooltip>
  );
}
