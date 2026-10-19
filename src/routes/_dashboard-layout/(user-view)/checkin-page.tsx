import { Trans, useLingui } from '@lingui/react/macro';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { CalendarCheckIcon, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { checkinSettingsQueryOptions, setCheckinEnabled } from '@/api/checkin';
import { useAuth } from '@/auth';
import { QueryBoundary } from '@/components/query-boundary';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { useDocumentTitle } from '@/hooks/use-document-title';

import { CheckinForm } from './checkin-page/-components/checkin-form';
import { CheckinSkeleton } from './checkin-page/-components/checkin-skeleton';

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/checkin-page'
)({
  component: CheckinPage
});

function CheckinPage() {
  const { t } = useLingui();
  const title = t`Check-in Page`;
  useDocumentTitle(title);

  return (
    <div className="space-y-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Trans>Settings</Trans>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex max-w-2xl flex-col gap-1">
        <h1 className="text-xl font-semibold text-balance">{title}</h1>
        <p className="text-sm text-pretty text-muted-foreground">
          <Trans>Let guests check in online before they arrive.</Trans>
        </p>
      </div>

      <QueryBoundary
        fallback={<CheckinSkeleton />}
        title={<Trans>Couldn't load the check-in settings</Trans>}
      >
        <CheckinScreens />
      </QueryBoundary>
    </div>
  );
}

/** Switched off: an invitation to switch it on. Switched on: the settings. */
function CheckinScreens() {
  const { t } = useLingui();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryOptions = checkinSettingsQueryOptions(
    user?.selected_property_id ?? null
  );
  const { data } = useSuspenseQuery(queryOptions);

  // Applied at once, apart from the form's Save.
  const switching = useMutation({
    mutationFn: setCheckinEnabled,
    onSuccess: (settings) =>
      queryClient.setQueryData(queryOptions.queryKey, settings),
    onError: (error, enabled) => {
      console.error('Failed to switch online check-in:', error);
      toast.error(
        enabled
          ? t`Failed to activate online check-in`
          : t`Failed to deactivate online check-in`,
        { description: error.message }
      );
    }
  });

  if (!data.enabled) {
    return (
      <Empty className="max-w-2xl">
        <EmptyHeader className="max-w-lg">
          <EmptyMedia variant="icon">
            <CalendarCheckIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            <Trans>Online check-in is not activated</Trans>
          </EmptyTitle>
          <EmptyDescription>
            <Trans>
              Guests get a link by email and can check in before they arrive.
              The page is created automatically from your hotel’s details.
            </Trans>
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            className="min-w-40"
            onClick={() => switching.mutate(true)}
            disabled={switching.isPending}
            aria-busy={switching.isPending}
          >
            {switching.isPending && (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            )}
            <Trans>Activate</Trans>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <CheckinForm
      // Keyed by property: switching it starts over from that property's state.
      key={user?.selected_property_id}
      settings={data}
      onSaved={(settings) =>
        queryClient.setQueryData(queryOptions.queryKey, settings)
      }
      onDeactivate={() => switching.mutateAsync(false)}
      isDeactivating={switching.isPending}
    />
  );
}
