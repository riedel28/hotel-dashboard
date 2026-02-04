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

export function ReservationStatusFilter({
  value,
  onChange
}: ReservationStatusFilterProps) {
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
        <SelectItem value="pending">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-yellow-500"></span>
            <span>
              <Trans>Pending</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="started">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-violet-500"></span>
            <span>
              <Trans>Started</Trans>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="done">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-green-500"></span>
            <span>
              <Trans>Done</Trans>
            </span>
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
