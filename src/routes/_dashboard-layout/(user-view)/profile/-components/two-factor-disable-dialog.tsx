import { Trans, useLingui } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, TriangleAlertIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { disableTwoFactor, profileKeys } from '@/api/profile';
import { isCompleteOtp, OtpField } from '@/components/otp-field';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

import { recoveryCodeSchema } from '../../../../../../shared/types/profile';
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
    ? recoveryCodeSchema.safeParse(code.trim()).success
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

            <div className="my-5 space-y-5">
              <Alert variant="warning">
                <TriangleAlertIcon aria-hidden="true" />
                <AlertDescription>
                  <Trans>
                    Your recovery codes will be deleted, and you'll be signed
                    out on all other devices.
                  </Trans>
                </AlertDescription>
              </Alert>

              <Field data-invalid={Boolean(error)} className="gap-2.5">
                <FieldDescription className="text-center">
                  {useRecoveryCode ? (
                    <Trans>Enter one of your unused recovery codes</Trans>
                  ) : (
                    <Trans>
                      Enter the current code from your authenticator app
                    </Trans>
                  )}
                </FieldDescription>

                <div className="flex justify-center text-center">
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
                </div>
              </Field>

              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto w-full p-0 text-center text-cyan-800 dark:text-cyan-200/85"
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
                variant="outline"
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
