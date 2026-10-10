import { Trans } from '@lingui/react/macro';

import {
  type ReservationState,
  reservationStateSchema
} from '@/api/reservations';
import type { DataGridCheckboxFilterOption } from '@/components/ui/data-grid-checkbox-filter';
import {
  DataGridCheckboxFilter,
  DataGridCheckboxFilterClear,
  DataGridCheckboxFilterFooter,
  DataGridCheckboxFilterPreset
} from '@/components/ui/data-grid-checkbox-filter';

import { StatusCell } from './reservations-table/-components/cells/status-cell';

const reservationStatuses = reservationStateSchema.options;

// Everything that has not checked out yet. A filter-only preset: it is never
// stored, the URL just carries the states it expands to.
const activeStatuses = reservationStatuses.filter(
  (status) => status !== 'checked_out'
);

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

  const isActiveSelected =
    value.length === activeStatuses.length &&
    activeStatuses.every((status) => value.includes(status));

  return (
    <DataGridCheckboxFilter
      label={<Trans>Status</Trans>}
      placeholder={<Trans>All statuses</Trans>}
      options={options}
      value={value}
      onValueChange={onValueChange}
      className={className}
      header={
        <DataGridCheckboxFilterPreset
          checked={isActiveSelected}
          onCheckedChange={(checked) =>
            onValueChange(checked ? activeStatuses : [])
          }
        >
          <Trans>Active</Trans>
        </DataGridCheckboxFilterPreset>
      }
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
