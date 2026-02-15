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

const statuses = [
  { value: 'available', color: 'bg-badge-success-foreground' },
  { value: 'occupied', color: 'bg-badge-info-foreground' },
  { value: 'maintenance', color: 'bg-badge-warning-foreground' },
  { value: 'out_of_order', color: 'bg-badge-destructive-foreground' }
] as const;

export function RoomStatusFilter({ value, onChange }: RoomStatusFilterProps) {
  const { t } = useLingui();

  return (
    <Select value={value ?? 'all'} onValueChange={onChange} defaultValue="all">
      <SelectTrigger className="w-full sm:w-[150px]">
        <SelectValue>
          {(val) => {
            if (!val || val === 'all') {
              return (
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-muted-foreground" />
                  <span>
                    <Trans>All</Trans>
                  </span>
                </span>
              );
            }
            const status = statuses.find((s) => s.value === val);
            return (
              <span className="flex items-center gap-2">
                <span
                  className={`size-1.5 rounded-full ${status?.color ?? 'bg-muted-foreground'}`}
                />
                <span className="capitalize">{t(val)}</span>
              </span>
            );
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value="all">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-muted-foreground"></span>
            <span>
              <Trans>All</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="available">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-badge-success-foreground"></span>
            <span>
              <Trans>Available</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="occupied">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-badge-info-foreground"></span>
            <span>
              <Trans>Occupied</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="maintenance">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-badge-warning-foreground"></span>
            <span>
              <Trans>Maintenance</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="out_of_order">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-badge-destructive-foreground"></span>
            <span>
              <Trans>Out of Order</Trans>
            </span>
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
