import { Trans, useLingui } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, TriangleAlertIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { disableTwoFactor, profileKeys } from '@/api/profile';
import { isCompleteOtp, OtpField } from '@/components/otp-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useReauthedAction } from './reauth-dialog';

interface TwoFactorDisableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Turning 2FA off is never one click: it weakens the account, so it costs a
 * live code (or a recovery code) exactly as switching it on did.
 */
export function TwoFactorDisableDialog({
  open,
  onOpenChange
}: TwoFactorDisableDialogProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const [code, setCode] = React.useState('');
  const [useRecoveryCode, setUseRecoveryCode] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setCode('');
    setUseRecoveryCode(false);
    setError(null);
  }, [open]);

  const action = useReauthedAction({
    action: (reauth) => disableTwoFactor(code, reauth),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.me });
      void queryClient.invalidateQueries({ queryKey: profileKeys.twoFactor });
      onOpenChange(false);
      toast.success(t`Two-factor authentication disabled`);
    },
    onError: (caught) => {
      setError(
        caught instanceof Error
          ? caught.message
          : t`That code isn't valid. Try again.`
      );
    }
  });

  const canSubmit = useRecoveryCode
    ? /^[a-z0-9]{4}-[a-z0-9]{4}$/.test(code.trim())
    : isCompleteOtp(code);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              action.run();
            }}
          >
            <DialogHeader>
              <DialogTitle>
                <Trans>Turn off two-factor authentication?</Trans>
              </DialogTitle>
              <DialogDescription>
                <Trans>
                  Your account will be protected by your password alone. Anyone
                  who learns it will be able to sign in.
                </Trans>
              </DialogDescription>
            </DialogHeader>

            <div className="my-5 space-y-4">
              <p className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
                <TriangleAlertIcon
                  className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500"
                  aria-hidden="true"
                />
                <Trans>
                  Your recovery codes will be deleted, and you'll be signed out
                  on all other devices.
                </Trans>
              </p>

              <Field data-invalid={Boolean(error)} className="gap-2">
                <FieldDescription>
                  {useRecoveryCode ? (
                    <Trans>Enter one of your unused recovery codes.</Trans>
                  ) : (
                    <Trans>
                      Enter the current code from your authenticator app.
                    </Trans>
                  )}
                </FieldDescription>

                {useRecoveryCode ? (
                  <Input
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.toLowerCase())
                    }
                    placeholder="a1b2-c3d4"
                    autoComplete="off"
                    spellCheck={false}
                    className="max-w-40 font-mono"
                    aria-invalid={Boolean(error)}
                    aria-label={t`Recovery code`}
                  />
                ) : (
                  <OtpField
                    value={code}
                    onChange={setCode}
                    invalid={Boolean(error)}
                    disabled={action.isRunning}
                  />
                )}

                {error && <FieldError errors={[{ message: error }]} />}
              </Field>

              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => {
                  setUseRecoveryCode((value) => !value);
                  setCode('');
                  setError(null);
                }}
              >
                {useRecoveryCode ? (
                  <Trans>Use a code from my app instead</Trans>
                ) : (
                  <Trans>I don't have my phone — use a recovery code</Trans>
                )}
              </Button>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                <Trans>Keep it on</Trans>
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!canSubmit || action.isRunning}
                aria-busy={action.isRunning}
              >
                {action.isRunning && (
                  <Loader2Icon
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                <Trans>Turn off</Trans>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {action.dialog}
    </>
  );
}
