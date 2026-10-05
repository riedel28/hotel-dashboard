import { Trans, useLingui } from '@lingui/react/macro';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { WifiOffIcon } from 'lucide-react';
import * as React from 'react';

import {
  meQueryOptions,
  profileKeys,
  twoFactorStatusQueryOptions
} from '@/api/profile';
import {
  type NavSection,
  SectionNav,
  useHashSectionJump
} from '@/components/section-nav';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { useDocumentTitle, useOnlineStatus } from '@/hooks';

import { PasswordSection } from './profile/-components/password-section';
import { PersonalSection } from './profile/-components/personal-section';
import {
  MobileSaveBar,
  UnsavedChangesGuard
} from './profile/-components/profile-section';
import { RolesSection } from './profile/-components/roles-section';
import { TwoFactorSection } from './profile/-components/two-factor-section';

export const Route = createFileRoute('/_dashboard-layout/(user-view)/profile')({
  component: RouteComponent,
  loader: ({ context }) => {
    // Kicked off alongside the profile rather than awaited with it: the shell
    // doesn't need it, but leaving it to the suspended card means the request
    // can't even start until /users/me has come back.
    void context.queryClient.prefetchQuery(twoFactorStatusQueryOptions());
    return context.queryClient.ensureQueryData(meQueryOptions());
  }
});

const SECTIONS: NavSection[] = [
  { id: 'profile', label: <Trans>Profile</Trans> },
  { id: 'password', label: <Trans>Password</Trans> },
  { id: 'two-factor', label: <Trans>Two-factor auth</Trans> },
  { id: 'roles', label: <Trans>Roles &amp; access</Trans> }
];

/**
 * One page, four cards, one scroll — not tabs. There are only four blocks and
 * none of them is long, and hiding two-factor behind a tab is how accounts stay
 * unprotected: people don't enable what they never see.
 *
 * Each card owns its own save. The three actions here are genuinely different
 * transactions — editing a name, re-authenticating to change a password, and
 * pairing an external device — and a single Save button over all of them can
 * only ever half-succeed.
 */
function RouteComponent() {
  const { t } = useLingui();
  useDocumentTitle(t`My profile`);

  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const { data: user } = useSuspenseQuery(meQueryOptions());

  const [personalDirty, setPersonalDirty] = React.useState(false);
  const [personalSaving, setPersonalSaving] = React.useState(false);
  const [conflictOpen, setConflictOpen] = React.useState(false);

  const personalControls = React.useRef<{
    save: () => void;
    reset: () => void;
  } | null>(null);

  const registerPersonalControls = React.useCallback(
    (controls: { save: () => void; reset: () => void }) => {
      personalControls.current = controls;
    },
    []
  );

  // Security emails link straight at a card ("/profile#two-factor").
  useHashSectionJump();

  return (
    <div className="space-y-1 pb-20 lg:pb-0">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Trans>My profile</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-6">
        <div className="flex max-w-2xl flex-col gap-1">
          <h1 className="text-xl font-semibold text-balance">
            <Trans>Profile</Trans>
          </h1>
          <p className="text-sm text-pretty text-muted-foreground">
            <Trans>
              Manage your personal details, security and access rights.
            </Trans>
          </p>
        </div>

        {!isOnline && (
          <Alert variant="warning" role="status">
            <WifiOffIcon aria-hidden="true" />
            <AlertDescription>
              <Trans>
                You're offline. Your changes are kept here and can be saved once
                you're back online.
              </Trans>
            </AlertDescription>
          </Alert>
        )}

        {/* The chip bar takes over wherever the side rail no longer fits. */}
        <SectionNav
          sections={SECTIONS}
          orientation="chips"
          className="lg:hidden"
        />

        <div className="flex flex-row gap-8">
          {/* Capped rather than full-bleed: a form line longer than about
              720px is measurably harder to read. */}
          <div className="flex min-w-0 flex-1 flex-col gap-6 lg:max-w-2xl">
            <PersonalSection
              user={user}
              onDirtyChange={setPersonalDirty}
              onSavingChange={setPersonalSaving}
              registerControls={registerPersonalControls}
              onConflict={() => setConflictOpen(true)}
            />

            <PasswordSection user={user} />

            <React.Suspense fallback={<SectionSkeleton />}>
              <TwoFactorSection />
            </React.Suspense>

            <RolesSection assignedRoles={user.roles} isAdmin={user.is_admin} />
          </div>

          {/* Rendered after the cards but shown before them: the sighted
              reading order puts navigation first, while assistive tech and the
              tab sequence reach the actual content without wading through it. */}
          <SectionNav
            sections={SECTIONS}
            className="order-first hidden lg:block"
          />
        </div>
      </div>

      <UnsavedChangesGuard when={personalDirty} />

      <MobileSaveBar
        visible={personalDirty}
        isSubmitting={personalSaving}
        onSave={() => personalControls.current?.save()}
        onCancel={() => personalControls.current?.reset()}
      />

      <AlertDialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans>This profile was updated elsewhere</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>
                Someone — most likely an administrator — changed your record
                while this page was open. Reload to see their version, or keep
                your edits and save again to overwrite it.
              </Trans>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConflictOpen(false)}>
              <Trans>Keep my changes</Trans>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void queryClient.invalidateQueries({
                  queryKey: profileKeys.me
                });
                setConflictOpen(false);
              }}
            >
              <Trans>Reload</Trans>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-4 rounded-xl p-6 shadow-xs ring-1 ring-foreground/10">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
