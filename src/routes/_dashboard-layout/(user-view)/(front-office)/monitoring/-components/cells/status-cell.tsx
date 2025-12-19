import { Trans, useLingui } from '@lingui/react/macro';
import { CheckIcon, XIcon } from 'lucide-react';
import { type MonitoringStatus } from 'shared/types/monitoring';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface StatusCellProps {
  status: MonitoringStatus;
}

export function StatusCell({ status }: StatusCellProps) {
  const { t } = useLingui();
  const isSuccess = status === 'success';

  return (
    <div className="flex items-center justify-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={
              isSuccess
                ? 'bg-emerald-100 text-emerald-600 rounded-full p-1'
                : 'bg-destructive/10 text-destructive rounded-full p-1'
            }
            aria-label={isSuccess ? t`Success` : t`Error`}
            role="img"
          >
            {isSuccess ? (
              <CheckIcon className="size-4" />
            ) : (
              <XIcon className="size-4" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isSuccess ? <Trans>Success</Trans> : <Trans>Error</Trans>}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
