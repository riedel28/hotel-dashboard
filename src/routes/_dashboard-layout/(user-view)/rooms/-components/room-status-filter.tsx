import { Trans } from '@lingui/react/macro';
import type { RoomStatus } from 'shared/types/rooms';

import { DataGridRadioFilter } from '@/components/ui/data-grid-radio-filter';

import { RoomStatusCell } from './rooms-table/-components/cells/room-status-cell';

const roomStatuses: RoomStatus[] = [
  'available',
  'occupied',
  'maintenance',
  'out_of_order'
];

interface RoomStatusFilterProps {
  value?: RoomStatus;
  onChange: (status: RoomStatus | undefined) => void;
}

export function RoomStatusFilter({ value, onChange }: RoomStatusFilterProps) {
  return (
    <DataGridRadioFilter
      label={<Trans>Status</Trans>}
      placeholder={<Trans>All statuses</Trans>}
      value={value}
      onValueChange={onChange}
      options={roomStatuses.map((status) => ({
        value: status,
        label: <RoomStatusCell status={status} />
      }))}
      showFooter
      className="w-full sm:w-[170px]"
    />
  );
}
