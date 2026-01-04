import { Trans, useLingui } from '@lingui/react/macro';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface RoomStatusFilterProps {
  value?: 'available' | 'occupied' | 'maintenance' | 'out_of_order' | 'all';
  onChange: (status: string | null) => void;
}

export function RoomStatusFilter({
  value,
  onChange
}: RoomStatusFilterProps) {
  const { t } = useLingui();

  return (
    <Select value={value ?? 'all'} onValueChange={onChange} defaultValue="all">
      <SelectTrigger className="w-full sm:w-[150px]">
        <SelectValue>
          {(val) =>
            val ? (
              <span className="capitalize">{t(val)}</span>
            ) : (
              <span className="text-muted-foreground">
                <Trans>Select status</Trans>
              </span>
            )
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value="all">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-gray-500"></span>
            <span>
              <Trans>All</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="available">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-green-500"></span>
            <span>
              <Trans>Available</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="occupied">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-blue-500"></span>
            <span>
              <Trans>Occupied</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="maintenance">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-yellow-500"></span>
            <span>
              <Trans>Maintenance</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="out_of_order">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-red-500"></span>
            <span>
              <Trans>Out of Order</Trans>
            </span>
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

