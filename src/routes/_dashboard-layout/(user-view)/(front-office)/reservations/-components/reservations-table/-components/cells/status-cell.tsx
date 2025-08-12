import { useLingui } from '@lingui/react/macro';
import type { ComponentProps } from 'react';

import { Badge } from '@/components/ui/badge';

import type { Reservation } from '@/api/reservations';

interface StatusCellProps {
  status: Reservation['state'];
}

export function StatusCell({ status }: StatusCellProps) {
  const { t } = useLingui();

  const variant: ComponentProps<typeof Badge>['variant'] =
    status === 'done' ? 'success' : status === 'pending' ? 'warning' : status === 'started' ? 'info' : 'secondary';

  const label =
    status === 'done' ? t`Done` : status === 'pending' ? t`Pending` : status === 'started' ? t`Started` : status;

  return (
    <Badge size="md" variant={variant} appearance="light">
      {label}
    </Badge>
  );
}


