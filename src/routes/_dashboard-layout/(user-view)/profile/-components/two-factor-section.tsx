import { Trans, useLingui } from '@lingui/react/macro';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  KeyRoundIcon,
  Loader2Icon,
  RotateCwIcon,
  ShieldIcon,
  SmartphoneIcon
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
import { cn } from '@/lib/utils';

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
  // Bumped on every open and used as the dialogs' key, so each opening starts
  // from fresh state rather than resetting the last run's by hand. Closing
  // leaves the key alone, so the close animation still plays.
  const [openings, setOpenings] = React.useState(0);
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
        <Badge
          color={status.enabled ? 'emerald' : 'yellow'}
          size="sm"
          className="rounded-md px-2 py-1"
        >
          <span
            aria-hidden="true"
            className={cn(
              'mr-0.5 size-1.5 rounded-full',
              status.enabled ? 'bg-success' : 'bg-warning'
            )}
          />
          {status.enabled ? <Trans>Enabled</Trans> : <Trans>Disabled</Trans>}
        </Badge>
      }
    >
      {status.enabled ? (
        <>
          <CardContent className="space-y-5">
            <Item className="p-0">
              <ItemMedia>
                <SmartphoneIcon
                  className="size-5 shrink-0 text-muted-foreground"
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
                  className="size-5 shrink-0 text-muted-foreground"
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
                          ? 'text-warning'
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
                    <span className="text-warning">
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
                    <Loader2Icon className="animate-spin" aria-hidden="true" />
                  ) : (
                    <RotateCwIcon />
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
              className="text-danger hover:bg-danger-soft hover:text-danger"
              onClick={() => {
                setOpenings((n) => n + 1);
                setDisableOpen(true);
              }}
            >
              <Trans>Turn off two-factor authentication</Trans>
            </Button>
          </CardFooter>
        </>
      ) : (
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg border bg-muted">
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

          <div className="flex justify-end">
            <Button
              type="button"
              // Full width on a phone, like every other card's main button.
              className="w-full sm:w-auto"
              onClick={() => {
                setOpenings((n) => n + 1);
                setSetupOpen(true);
              }}
            >
              <Trans>Enable two-factor authentication</Trans>
            </Button>
          </div>

          <AuthenticatorApps />
        </CardContent>
      )}

      <TwoFactorSetupDialog
        key={`setup-${openings}`}
        open={setupOpen}
        onOpenChange={setSetupOpen}
      />
      <TwoFactorDisableDialog
        key={`disable-${openings}`}
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
