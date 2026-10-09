import { Trans, useLingui } from '@lingui/react/macro';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { HistoryIcon } from 'lucide-react';
import { toast } from 'sonner';

import { createWorklog, worklogsQueryOptions } from '@/api/worklogs';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Item } from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

import { WorklogCard, WorklogMessageForm } from './worklog-card';
import { dayKind, groupByDay } from './worklog-days';

function DayHeading({ day }: { day: string }) {
  const { t, i18n } = useLingui();
  const kind = dayKind(day);
  // `day` is a local YYYY-MM-DD; parse it as local, not as UTC midnight.
  const date = new Date(`${day}T00:00`);
  const label =
    kind === 'today'
      ? t`Today`
      : kind === 'yesterday'
        ? t`Yesterday`
        : new Intl.DateTimeFormat(i18n.locale, {
            day: 'numeric',
            month: 'long',
            year: kind === 'older' ? 'numeric' : undefined
          }).format(date);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <time
            dateTime={day}
            className="text-sm font-semibold text-muted-foreground"
          />
        }
      >
        {label}
      </TooltipTrigger>
      <TooltipContent>
        {new Intl.DateTimeFormat(i18n.locale, { dateStyle: 'full' }).format(
          date
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function WorkLog({ propertyId }: { propertyId: string }) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const { data: worklogs } = useSuspenseQuery(worklogsQueryOptions(propertyId));

  const createMutation = useMutation({
    mutationFn: (message: string) => createWorklog(propertyId, { message }),
    onSuccess: () =>
      queryClient.invalidateQueries(worklogsQueryOptions(propertyId)),
    onError: () => {
      toast.error(t`Failed to add entry. Please try again.`);
    }
  });

  return (
    <div className="max-w-2xl space-y-6">
      <WorklogMessageForm
        placeholder={t`Write a note about this property…`}
        submitLabel={<Trans>Add entry</Trans>}
        onSubmit={createMutation.mutateAsync}
      />

      {worklogs.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HistoryIcon />
            </EmptyMedia>
            <EmptyTitle>
              <Trans>No entries yet</Trans>
            </EmptyTitle>
            <EmptyDescription>
              <Trans>
                Notes your team adds about this property will be listed here.
              </Trans>
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        groupByDay(worklogs).map(([day, entries]) => (
          <section key={day} className="space-y-2">
            <h2>
              <DayHeading day={day} />
            </h2>
            {entries.map((worklog) => (
              <WorklogCard key={worklog.id} worklog={worklog} />
            ))}
          </section>
        ))
      )}
    </div>
  );
}

export function WorkLogSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <Skeleton className="h-28 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-20" />
        {[0, 1, 2].map((key) => (
          <Item
            key={key}
            variant="outline"
            className="flex-col items-stretch gap-2 p-4"
          >
            <div className="flex h-7 items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-3.5 w-40" />
            </div>
            <Skeleton className="h-3.5 w-4/5" />
          </Item>
        ))}
      </div>
    </div>
  );
}
