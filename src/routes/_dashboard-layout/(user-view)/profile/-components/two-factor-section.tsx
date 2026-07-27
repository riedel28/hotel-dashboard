import { Trans, useLingui } from '@lingui/react/macro';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  KeyRoundIcon,
  Loader2Icon,
  RotateCwIcon,
  ShieldIcon,
  SmartphoneIcon,
  TriangleAlertIcon
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import {
  profileKeys,
  regenerateRecoveryCodes,
  twoFactorStatusQueryOptions
} from '@/api/profile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from '@/components/ui/item';
import { AuthenticatorApps } from './authenticator-apps';
import { ProfileSection } from './profile-section';
import { useReauthedAction } from './reauth-dialog';
import { RecoveryCodes } from './recovery-codes';
import { TwoFactorDisableDialog } from './two-factor-disable-dialog';
import { TwoFactorSetupDialog } from './two-factor-setup-dialog';

dayjs.extend(relativeTime);

/** Below this the user is close to locking themselves out. */
const LOW_RECOVERY_CODES = 4;

export function TwoFactorSection() {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const { data: status } = useSuspenseQuery(twoFactorStatusQueryOptions());

  const [setupOpen, setSetupOpen] = React.useState(false);
  const [disableOpen, setDisableOpen] = React.useState(false);
  const [freshCodes, setFreshCodes] = React.useState<string[] | null>(null);

  const regenerate = useReauthedAction({
    action: regenerateRecoveryCodes,
    onSuccess: (result) => {
      setFreshCodes(result.recovery_codes);
      void queryClient.invalidateQueries({ queryKey: profileKeys.twoFactor });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t`Couldn't generate new recovery codes`
      );
    }
  });

  return (
    <ProfileSection
      id="two-factor"
      title={<Trans>Two-factor authentication</Trans>}
      description={
        <Trans>A second step at sign-in, from an app on your phone.</Trans>
      }
      action={
        status.enabled ? (
          <Badge
            color="emerald"
            size="sm"
            className="px-2 py-1 rounded-md border-foreground/10"
          >
            <span
              className="size-1.5 bg-emerald-700 dark:bg-emerald-300 rounded-full mr-0.5"
              aria-hidden="true"
            />
            <Trans>Enabled</Trans>
          </Badge>
        ) : (
          <Badge
            color="gray"
            size="sm"
            className="px-2 py-1 rounded-md border-foreground/10"
          >
            <span
              aria-hidden="true"
              className="bg-muted-foreground/60 size-1.5 rounded-full mr-0.5"
            />
            <Trans>Disabled</Trans>
          </Badge>
        )
      }
    >
      {status.enabled ? (
        <>
          <CardContent className="space-y-5">
            <Item className="p-0">
              <ItemMedia>
                <SmartphoneIcon
                  className="text-muted-foreground size-5 shrink-0"
                  aria-hidden="true"
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  <Trans>Authenticator app</Trans>
                </ItemTitle>
                <ItemDescription>
                  {status.enabled_at && (
                    <Trans>
                      Added on {dayjs(status.enabled_at).format('D MMM YYYY')}
                    </Trans>
                  )}
                  {status.last_used_at && (
                    <>
                      {' · '}
                      <Trans>
                        Last used {dayjs(status.last_used_at).fromNow()}
                      </Trans>
                    </>
                  )}
                </ItemDescription>
              </ItemContent>
            </Item>
            <Item className="p-0">
              <ItemMedia>
                <KeyRoundIcon
                  className="text-muted-foreground size-5 shrink-0"
                  aria-hidden="true"
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  <Trans>Recovery codes</Trans>
                </ItemTitle>
                <ItemDescription>
                  {status.recovery_codes_generated ? (
                    <span
                      className={
                        status.recovery_codes_remaining < LOW_RECOVERY_CODES
                          ? 'text-amber-600 dark:text-amber-500'
                          : 'text-muted-foreground'
                      }
                    >
                      <Trans>
                        {status.recovery_codes_remaining} of 10 codes remaining
                      </Trans>
                      {' · '}
                      <Trans>Each code works once</Trans>
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-500">
                      <Trans>You haven't saved any recovery codes yet.</Trans>
                    </span>
                  )}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={regenerate.run}
                  disabled={regenerate.isRunning}
                  aria-busy={regenerate.isRunning}
                >
                  {regenerate.isRunning ? (
                    <Loader2Icon
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <RotateCwIcon className="size-3.25 mr-0.5" />
                  )}
                  <Trans>Regenerate</Trans>
                </Button>
              </ItemActions>
            </Item>
          </CardContent>

          <CardFooter>
            <Button
              type="button"
              variant="ghost"
              className="text-danger hover:text-danger hover:bg-destructive/10"
              onClick={() => setDisableOpen(true)}
            >
              <Trans>Turn off two-factor authentication</Trans>
            </Button>
          </CardFooter>
        </>
      ) : (
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-muted grid size-9 shrink-0 place-items-center rounded-lg border">
              <ShieldIcon className="size-4" aria-hidden="true" />
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium">
                <Trans>Protect your account with a second step</Trans>
              </p>
              <p className="text-muted-foreground">
                <Trans>
                  After entering your password you'll enter a 6-digit code from
                  an authenticator app on your phone. It takes about a minute to
                  set up.
                </Trans>
              </p>
            </div>
          </div>

          <Button type="button" onClick={() => setSetupOpen(true)}>
            <Trans>Enable two-factor authentication</Trans>
          </Button>

          <AuthenticatorApps />
        </CardContent>
      )}

      <TwoFactorSetupDialog open={setupOpen} onOpenChange={setSetupOpen} />
      <TwoFactorDisableDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
      />
      {regenerate.dialog}

      <Dialog
        open={freshCodes !== null}
        onOpenChange={(open) => {
          if (!open) setFreshCodes(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <Trans>Your new recovery codes</Trans>
            </DialogTitle>
            <DialogDescription>
              <Trans>
                Your previous codes no longer work. Save these somewhere safe —
                this is the only time they're shown.
              </Trans>
            </DialogDescription>
          </DialogHeader>
          {freshCodes && <RecoveryCodes codes={freshCodes} />}
          <DialogFooter>
            <Button type="button" onClick={() => setFreshCodes(null)}>
              <Trans>Done</Trans>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProfileSection>
  );
}

/** Nav callout that pulls attention to an account still without 2FA. */
export function TwoFactorNavCallout() {
  const { data: status } = useSuspenseQuery(twoFactorStatusQueryOptions());

  if (status.enabled) return null;

  return (
    <div className="space-y-1.5 text-sm">
      <p className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-500">
        <TriangleAlertIcon className="size-3.5 shrink-0" aria-hidden="true" />
        <Trans>2FA is off</Trans>
      </p>
      <a
        href="#two-factor"
        className="rounded-sm text-sm text-cyan-800 underline-offset-4 outline-none hover:underline focus-visible:shadow-[0_0_0_2px_var(--color-primary)] dark:text-cyan-200/90"
      >
        <Trans>Enable now</Trans>
      </a>
    </div>
  );
}
