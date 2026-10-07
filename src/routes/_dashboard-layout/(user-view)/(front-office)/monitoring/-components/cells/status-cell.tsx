import { Trans } from '@lingui/react/macro';
import { type MonitoringStatus } from 'shared/types/monitoring';

import { Badge } from '@/components/ui/badge';

interface StatusCellProps {
  status: MonitoringStatus;
  /** How many logs have this status; shown inside the badge when given. */
  count?: number;
}

export function StatusCell({ status, count }: StatusCellProps) {
  const isSuccess = status === 'success';

  return (
    <Badge
      size="sm"
      variant="outline"
      color={isSuccess ? 'emerald' : 'rose'}
      className="rounded-md"
    >
      <span className="mr-0.5 size-1.25 rounded-full bg-current/80"></span>
      {isSuccess ? <Trans>OK</Trans> : <Trans>Error</Trans>}
      {count !== undefined && <span className="tabular-nums">{count}</span>}
    </Badge>
  );
}
