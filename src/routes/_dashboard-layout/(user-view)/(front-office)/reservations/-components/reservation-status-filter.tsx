import { Trans } from '@lingui/react/macro';

import type { ReservationState } from '@/api/reservations';
import type { DataGridCheckboxFilterOption } from '@/components/ui/data-grid-checkbox-filter';

import { DataGridCheckboxFilter } from '@/components/ui/data-grid-checkbox-filter';

import { getReservationStatusStyle } from './reservation-status';

function StatusDot({ status }: { status: ReservationState }) {
  return (
    <span
      className={`ml-1 size-1.5 shrink-0 rounded-full ${getReservationStatusStyle(status).dotClassName}`}
      aria-hidden="true"
    />
  );
}

const reservationStatusOptions: DataGridCheckboxFilterOption<ReservationState>[] =
  [
    {
      value: 'pending',
      label: <Trans>Pending</Trans>,
      icon: <StatusDot status="pending" />
    },
    {
      value: 'started',
      label: <Trans>Started</Trans>,
      icon: <StatusDot status="started" />
    },
    {
      value: 'done',
      label: <Trans>Done</Trans>,
      icon: <StatusDot status="done" />
    }
  ];

interface ReservationStatusFilterProps {
  value: ReservationState[];
  onValueChange: (value: ReservationState[]) => void;
  className?: string;
}

function ReservationStatusFilter({
  value,
  onValueChange,
  className
}: ReservationStatusFilterProps) {
  return (
    <DataGridCheckboxFilter
      label={<Trans>Status</Trans>}
      placeholder={<Trans>Select status</Trans>}
      options={reservationStatusOptions}
      value={value}
      onValueChange={onValueChange}
      className={className}
    />
  );
}

export { ReservationStatusFilter };
