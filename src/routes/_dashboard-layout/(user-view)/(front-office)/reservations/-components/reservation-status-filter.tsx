import { Trans } from '@lingui/react/macro';

import type { ReservationState } from '@/api/reservations';
import type { DataGridCheckboxFilterOption } from '@/components/ui/data-grid-checkbox-filter';
import {
  DataGridCheckboxFilter,
  DataGridCheckboxFilterClear,
  DataGridCheckboxFilterFooter
} from '@/components/ui/data-grid-checkbox-filter';

import { StatusCell } from './reservations-table/-components/cells/status-cell';

const reservationStatuses: ReservationState[] = ['pending', 'started', 'done'];

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
  const options: DataGridCheckboxFilterOption<ReservationState>[] =
    reservationStatuses.map((status) => ({
      value: status,
      label: <StatusCell status={status} />
    }));

  return (
    <DataGridCheckboxFilter
      label={<Trans>Status</Trans>}
      placeholder={<Trans>All statuses</Trans>}
      options={options}
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      <DataGridCheckboxFilterFooter>
        <DataGridCheckboxFilterClear>
          <Trans>Reset</Trans>
        </DataGridCheckboxFilterClear>
      </DataGridCheckboxFilterFooter>
    </DataGridCheckboxFilter>
  );
}

export { ReservationStatusFilter };
