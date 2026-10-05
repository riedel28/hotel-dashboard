import { Trans, useLingui } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronDownIcon,
  Loader2Icon,
  ShieldCheckIcon,
  SmartphoneIcon
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { ApiError } from '@/api/client';
import {
  enableTwoFactor,
  profileKeys,
  startTwoFactorSetup
} from '@/api/profile';
import { isCompleteOtp, OtpField, OtpHint } from '@/components/otp-field';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { CopyButton } from '@/components/ui/copy-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';

import type { TwoFactorSetupResponse } from '../../../../../../shared/types/profile';
import { AuthenticatorApps } from './authenticator-apps';
import { useReauthedAction } from './reauth-dialog';
import { RecoveryCodes } from './recovery-codes';

/** Wrong codes in a row before the Verify button goes quiet for a while. */
const ATTEMPTS_BEFORE_COOLDOWN = 3;
const COOLDOWN_SECONDS = 30;

type Step = 'scan' | 'verify' | 'codes';

const STEP_ORDER: Step[] = ['scan', 'verify', 'codes'];

interface TwoFactorSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TwoFactorSetupDialog({
  open,
  onOpenChange
}: TwoFactorSetupDialogProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const [step, setStep] = React.useState<Step>('scan');
  const [setupData, setSetupData] =
    React.useState<TwoFactorSetupResponse | null>(null);
  const [code, setCode] = React.useState('');
  const [codeError, setCodeError] = React.useState<string | null>(null);
  const [attempts, setAttempts] = React.useState(0);
  const [cooldown, setCooldown] = React.useState(0);
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[] | null>(
    null
  );
  const [codesAcknowledged, setCodesAcknowledged] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  const setup = useReauthedAction({
    action: startTwoFactorSetup,
    onSuccess: (data) => setSetupData(data),
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : t`Couldn't start setup`
      );
      onOpenChange(false);
    }
  });

  const { run: runSetup } = setup;

  // Fetch a QR the moment the dialog opens; the first step is useless without it.
  React.useEffect(() => {
    if (!open) return;
    setStep('scan');
    setSetupData(null);
    setCode('');
    setCodeError(null);
    setAttempts(0);
    setCooldown(0);
    setRecoveryCodes(null);
    setCodesAcknowledged(false);
    setConfirmCancel(false);
    runSetup();
  }, [open, runSetup]);

  // Keyed on whether a cooldown is running, not on its value — depending on the
  // count itself would rebuild the interval on every tick.
  const cooldownActive = cooldown > 0;
  React.useEffect(() => {
    if (!cooldownActive) return;
    const timer = window.setInterval(
      () => setCooldown((seconds) => Math.max(0, seconds - 1)),
      1000
    );
    return () => window.clearInterval(timer);
  }, [cooldownActive]);

  const verify = async (submitted: string) => {
    if (cooldown > 0 || isVerifying) return;

    setIsVerifying(true);
    setCodeError(null);

    try {
      const result = await enableTwoFactor(submitted);
      setRecoveryCodes(result.recovery_codes);
      setStep('codes');
      void queryClient.invalidateQueries({ queryKey: profileKeys.me });
      void queryClient.invalidateQueries({ queryKey: profileKeys.twoFactor });
    } catch (error) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setCode('');

      if (nextAttempts >= ATTEMPTS_BEFORE_COOLDOWN) {
        setCooldown(COOLDOWN_SECONDS);
        setAttempts(0);
      }

      setCodeError(
        error instanceof ApiError
          ? error.message
          : t`That code isn't valid. Check your app and try again.`
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const enabled = recoveryCodes !== null;

  const requestClose = () => {
    // Once the codes exist 2FA is already on; closing is finishing, not aborting.
    if (enabled) {
      finish();
      return;
    }
    setConfirmCancel(true);
  };

  const finish = () => {
    onOpenChange(false);
    if (enabled) {
      toast.success(t`Two-factor authentication enabled`);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) requestClose();
        }}
      >
        <DialogContent
          className="max-h-[90dvh] gap-0 overflow-y-auto sm:max-w-lg"
          // Small screens get a full-height sheet rather than a floating box.
          showCloseButton={!confirmCancel}
        >
          <DialogHeader>
            <StepIndicator current={step} />
            <DialogTitle>
              {step === 'scan' && <Trans>Scan this QR code</Trans>}
              {step === 'verify' && <Trans>Enter the 6-digit code</Trans>}
              {step === 'codes' && (
                <span className="flex items-center gap-2">
                  <ShieldCheckIcon
                    className="size-5 text-emerald-600 dark:text-emerald-500"
                    aria-hidden="true"
                  />
                  <Trans>Two-factor authentication is on</Trans>
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {step === 'scan' && (
                <Trans>
                  Open your authenticator app and scan the code below.
                </Trans>
              )}
              {step === 'verify' && (
                <Trans>Your app generates a new code every 30 seconds.</Trans>
              )}
              {step === 'codes' && (
                <Trans>
                  Save your recovery codes. You'll need them if you lose your
                  phone, and each one works only once.
                </Trans>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-5">
            {step === 'scan' && <ScanStep data={setupData} />}
            {step === 'verify' && (
              <VerifyStep
                code={code}
                onCodeChange={(value) => {
                  setCode(value);
                  if (codeError) setCodeError(null);
                }}
                onComplete={verify}
                error={codeError}
                cooldown={cooldown}
                disabled={isVerifying}
              />
            )}
            {step === 'codes' && recoveryCodes && (
              <div className="space-y-4">
                <RecoveryCodes codes={recoveryCodes} />
                <Field orientation="horizontal" className="items-start gap-2.5">
                  <Checkbox
                    id="codes-saved"
                    checked={codesAcknowledged}
                    onCheckedChange={(checked) =>
                      setCodesAcknowledged(checked === true)
                    }
                  />
                  <FieldLabel
                    htmlFor="codes-saved"
                    className="cursor-pointer text-sm font-normal"
                  >
                    <Trans>I've saved my recovery codes in a safe place</Trans>
                  </FieldLabel>
                </Field>
              </div>
            )}
          </div>

          <DialogFooter>
            {step === 'scan' && (
              <>
                <Button type="button" variant="ghost" onClick={requestClose}>
                  <Trans>Cancel</Trans>
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep('verify')}
                  disabled={!setupData}
                >
                  <Trans>Next</Trans>
                </Button>
              </>
            )}
            {step === 'verify' && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('scan')}
                >
                  <Trans>Back</Trans>
                </Button>
                <Button
                  type="button"
                  onClick={() => void verify(code)}
                  disabled={!isCompleteOtp(code) || cooldown > 0 || isVerifying}
                  aria-busy={isVerifying}
                >
                  {isVerifying && (
                    <Loader2Icon
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {cooldown > 0 ? (
                    <Trans>Wait {cooldown}s</Trans>
                  ) : (
                    <Trans>Verify</Trans>
                  )}
                </Button>
              </>
            )}
            {step === 'codes' && (
              <Button
                type="button"
                onClick={finish}
                disabled={!codesAcknowledged}
              >
                <Trans>Done</Trans>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {setup.dialog}

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent className="sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans>Cancel setup?</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>
                Two-factor authentication won't be enabled and your account will
                keep using just a password.
              </Trans>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmCancel(false)}>
              <Trans>Keep setting up</Trans>
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setConfirmCancel(false);
                onOpenChange(false);
              }}
            >
              <Trans>Cancel setup</Trans>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const index = STEP_ORDER.indexOf(current);

  return (
    <div className="mb-3 flex items-center gap-3">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {STEP_ORDER.map((step, position) => (
          <span
            key={step}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              position === index
                ? 'w-6 bg-primary'
                : position < index
                  ? 'w-1.5 bg-primary/50'
                  : 'w-1.5 bg-border'
            )}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-muted-foreground">
        <Trans>
          Step {index + 1} of {STEP_ORDER.length}
        </Trans>
      </span>
    </div>
  );
}

function ScanStep({ data }: { data: TwoFactorSetupResponse | null }) {
  const { t } = useLingui();

  if (!data) {
    return (
      <div className="grid h-60 place-items-center">
        <Loader2Icon
          className="size-6 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        {/* White plate regardless of theme — a dark-inverted QR won't scan. */}
        <img
          src={data.qr_data_uri}
          alt={t`QR code for setting up two-factor authentication`}
          width={200}
          height={200}
          className="rounded-lg bg-white p-3"
        />
      </div>

      <Collapsible>
        <CollapsibleTrigger className="group/manual flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          <ChevronDownIcon
            className="size-4 transition-transform group-data-[panel-open]/manual:rotate-180"
            aria-hidden="true"
          />
          <Trans>Can't scan the code? Enter the key manually</Trans>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 space-y-2 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-sm tracking-wider break-all">
                {data.secret}
              </code>
              <CopyButton
                text={data.secret.replace(/ /g, '')}
                copyLabel={t`Copy setup key`}
                copiedLabel={t`Setup key copied`}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              <Trans>Time-based (TOTP) · 6 digits · 30 seconds</Trans>
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/*
        Setting 2FA up on the same tablet that holds the authenticator means
        there's no second camera to scan with — this hands the app the secret
        directly instead.
      */}
      <a
        href={data.otpauth_uri}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'w-full sm:hidden'
        )}
      >
        <SmartphoneIcon aria-hidden="true" />
        <Trans>Open in my authenticator app</Trans>
      </a>

      <AuthenticatorApps />
    </div>
  );
}

function VerifyStep({
  code,
  onCodeChange,
  onComplete,
  error,
  cooldown,
  disabled
}: {
  code: string;
  onCodeChange: (value: string) => void;
  onComplete: (value: string) => void;
  error: string | null;
  cooldown: number;
  disabled: boolean;
}) {
  return (
    <Field data-invalid={Boolean(error)} className="gap-3">
      <OtpField
        value={code}
        onChange={onCodeChange}
        onComplete={onComplete}
        invalid={Boolean(error)}
        disabled={disabled || cooldown > 0}
        aria-describedby="totp-hint"
        autoFocus
      />
      {error && <FieldError errors={[{ message: error }]} />}
      {cooldown > 0 && (
        <p className="text-sm text-muted-foreground">
          <Trans>Too many attempts. Try again in {cooldown} seconds.</Trans>
        </p>
      )}
      <OtpHint id="totp-hint" />
    </Field>
  );
}
