import { Trans } from '@lingui/react/macro';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';

/**
 * The app's 404, in the route error's card (framed icon tile, plain title,
 * muted description), with a way back and a way to the start page instead of
 * Try again. Like the route error, by default inside the layouts above it,
 * so the sidebar stays usable; `fullScreen` when there is no layout left.
 */
function NotFound({ fullScreen = false }: { fullScreen?: boolean }) {
  const router = useRouter();
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullScreen ? 'min-h-screen p-4' : 'min-h-[60vh]'
      )}
    >
      <Empty className="min-h-72 w-full max-w-lg flex-none gap-5 border-solid bg-card md:p-10">
        <EmptyHeader className="gap-1.5">
          <EmptyMedia className="mb-2 size-11 rounded-lg border text-muted-foreground dark:border-input dark:bg-input/30">
            <SearchIcon className="size-5" strokeWidth={1.75} aria-hidden />
          </EmptyMedia>
          <EmptyTitle className="text-base font-semibold tracking-normal text-foreground">
            <Trans>Page not found</Trans>
          </EmptyTitle>
          <EmptyDescription className="max-w-xs">
            <Trans>Sorry, we couldn't find the page you're looking for.</Trans>
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button variant="outline" onClick={() => router.history.back()}>
            <Trans>Go back</Trans>
          </Button>
          <Button onClick={() => void navigate({ to: '/' })}>
            <Trans>Go to Start</Trans>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}

/** For a path no layout matches. */
function FullScreenNotFound() {
  return <NotFound fullScreen />;
}

export { FullScreenNotFound, NotFound };
