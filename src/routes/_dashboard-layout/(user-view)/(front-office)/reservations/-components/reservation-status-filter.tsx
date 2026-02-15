import { Trans, useLingui } from '@lingui/react/macro';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface ReservationStatusFilterProps {
  value?: 'pending' | 'started' | 'done' | 'all';
  onChange: (status: string | null) => void;
}

const statuses = [
  { value: 'pending', color: 'bg-badge-warning-foreground' },
  { value: 'started', color: 'bg-badge-default-foreground' },
  { value: 'done', color: 'bg-badge-success-foreground' }
] as const;

export function ReservationStatusFilter({
  value,
  onChange
}: ReservationStatusFilterProps) {
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
            <span className="size-1.5 rounded-full bg-muted-foreground" />
            <span>
              <Trans>All</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="pending">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-badge-warning-foreground" />
            <span>
              <Trans>Pending</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="started">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-badge-default-foreground" />
            <span>
              <Trans>Started</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="done">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-badge-success-foreground" />
            <span>
              <Trans>Done</Trans>
            </span>
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
