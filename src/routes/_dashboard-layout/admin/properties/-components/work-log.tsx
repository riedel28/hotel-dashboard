import { Trans, useLingui } from '@lingui/react/macro';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import dayjs from 'dayjs';
import { HistoryIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { createWorklog, worklogsQueryOptions } from '@/api/worklogs';
import { useAuth } from '@/auth';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useFormatLocalized } from '@/hooks/use-format-localized';

import { WorklogAvatar, WorklogCard } from './worklog-card';
import { dayKind, groupByDay } from './worklog-days';
import { WorklogMessageForm } from './worklog-message-form';

// Flush with the title and the tabs, as the Details card is.
const WRAP = 'max-w-[620px] space-y-6 pt-2';

function DayHeading({ date }: { date: Date }) {
  const { t } = useLingui();
  const formatLocalized = useFormatLocalized();
  const kind = dayKind(date);
  const label =
    kind === 'today'
      ? t`Today`
      : kind === 'yesterday'
        ? t`Yesterday`
        : formatLocalized(date, {
            day: 'numeric',
            month: 'long',
            year: kind === 'older' ? 'numeric' : undefined
          });

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <time
            dateTime={dayjs(date).format('YYYY-MM-DD')}
            className="text-sm font-semibold text-muted-foreground"
          />
        }
      >
        {label}
      </TooltipTrigger>
      <TooltipContent>
        {formatLocalized(date, { dateStyle: 'full' })}
      </TooltipContent>
    </Tooltip>
  );
}

export function WorkLog({ propertyId }: { propertyId: string }) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: worklogs } = useSuspenseQuery(worklogsQueryOptions(propertyId));

  const [formKey, setFormKey] = useState(0);

  const createMutation = useMutation({
    mutationFn: (message: string) => createWorklog(propertyId, { message }),
    onSuccess: async () => {
      await queryClient.invalidateQueries(worklogsQueryOptions(propertyId));
      setFormKey((key) => key + 1);
    },
    onError: () => {
      toast.error(t`Failed to add entry. Please try again.`);
    }
  });

  return (
    <div className={WRAP}>
      {/* On the entries' grid: the writer's avatar over their column */}
      <div className="grid grid-cols-[1.5rem_1fr] gap-x-3">
        <div className="flex h-9 items-center">
          <WorklogAvatar user={user} />
        </div>
        <WorklogMessageForm
          // Remounted after each save, which clears the draft.
          key={formKey}
          placeholder={t`Write a note about this property…`}
          submitLabel={<Trans>Add entry</Trans>}
          isPending={createMutation.isPending}
          onSubmit={createMutation.mutate}
          textareaClassName="min-h-21"
        />
      </div>

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
        groupByDay(worklogs).map(({ date, entries }) => (
          <section key={date.getTime()} className="space-y-3">
            <h2>
              <DayHeading date={date} />
            </h2>
            <ol>
              {entries.map((worklog, index) => (
                <li key={worklog.id} className="relative pb-5 last:pb-0">
                  {/* The line down to the day's next entry, under the avatars */}
                  {index < entries.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-8 bottom-1 left-3 -translate-x-1/2 border-l"
                    />
                  )}
                  <WorklogCard worklog={worklog} />
                </li>
              ))}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}

export function WorkLogSkeleton() {
  return (
    <div className={WRAP}>
      <Skeleton className="h-33 w-full" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="grid grid-cols-[1.5rem_1fr] gap-x-3 gap-y-1 pb-5"
          >
            <Skeleton className="mt-0.5 size-6 rounded-full" />
            <Skeleton className="mt-2 h-3.5 w-40" />
            <Skeleton className="col-start-2 h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
