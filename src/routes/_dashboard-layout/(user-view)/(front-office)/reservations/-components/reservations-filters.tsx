import { Trans, useLingui } from '@lingui/react/macro';
import { RefreshCwIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { cn } from '@/lib/utils';

import { ReservationDateFilter } from './reservations-table/reservation-date-filter';

interface ReservationsFiltersProps {
  q: string | undefined;
  status: 'pending' | 'started' | 'done' | 'all' | undefined;
  from: Date | undefined;
  to: Date | undefined;
  isFetching: boolean;
  onSearchChange: (searchTerm: string) => void;
  onStatusChange: (status: string | null) => void;
  onDateChange: (dateRange: { from?: Date; to?: Date } | undefined) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
}

export function ReservationsFilters({
  q,
  status,
  from,
  to,
  isFetching,
  onSearchChange,
  onStatusChange,
  onDateChange,
  onClearFilters,
  onRefresh
}: ReservationsFiltersProps) {
  const { t } = useLingui();

  const hasActiveFilters = q || from || to || (status && status !== 'all');

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={q || ''}
            onChange={onSearchChange}
            placeholder={t`Search reservations`}
            wrapperClassName="w-full sm:w-[250px]"
            debounceMs={500}
          />
          <Select
            value={status ?? 'all'}
            onValueChange={onStatusChange}
            defaultValue="all"
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue>
                {(value) =>
                  value ? (
                    <span className="capitalize">{t(value)}</span>
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
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ReservationDateFilter
            from={from}
            to={to}
            onDateChange={onDateChange}
            className="w-full sm:w-[208px]"
          />
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon />
              <Trans>Clear filters</Trans>
            </Button>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isFetching}
        className="w-full sm:w-auto"
      >
        <RefreshCwIcon
          className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')}
        />
        <Trans>Refresh</Trans>
      </Button>
    </div>
  );
}

