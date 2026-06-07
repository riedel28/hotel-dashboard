import { Trans } from '@lingui/react/macro';
import { type MonitoringStatus } from 'shared/types/monitoring';

import { Badge } from '@/components/ui/badge';

interface StatusCellProps {
  status: MonitoringStatus;
}

export function StatusCell({ status }: StatusCellProps) {
  const isSuccess = status === 'success';

  return (
    <Badge
      size="sm"
      variant="outline"
      color={isSuccess ? 'emerald' : 'pink'}
      className="rounded-md"
    >
      <span className="size-1.25 rounded-full bg-current/80 mr-0.5"></span>
      {isSuccess ? <Trans>Ready</Trans> : <Trans>Error</Trans>}
    </Badge>
  );
}
