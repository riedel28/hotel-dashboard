import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import { CheckIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ApiError } from '@/api/client';
import { changePassword } from '@/api/profile';
import { isCompleteOtp, OtpField } from '@/components/otp-field';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Link } from '@/components/ui/link';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';

import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  strongPasswordSchema,
  type User
} from '../../../../../../shared/types/users';
import {
  ProfileSection,
  ProfileSectionForm,
  useSuccessFlash
} from './profile-section';

interface PasswordSectionProps {
  user: User;
}

export function PasswordSection({ user }: PasswordSectionProps) {
  const { t: lingui } = useLingui();
  const twoFactorEnabled = user.two_factor_enabled ?? false;
  const { flash, flashClass } = useSuccessFlash();
  const [capsLockOn, setCapsLockOn] = React.useState(false);
  const [signedOutElsewhere, setSignedOutElsewhere] = React.useState(false);

  const schema = React.useMemo(
    () =>
      z
        .object({
          current_password: z.string().min(1, t`Current password is required`),
          new_password: strongPasswordSchema,
          confirm_password: z.string().min(1, t`Please confirm your password`),
          totp_code: z.string()
        })
        .refine((data) => data.new_password === data.confirm_password, {
          message: t`Passwords don't match`,
          path: ['confirm_password']
        })
        .refine((data) => data.new_password !== data.current_password, {
          message: t`New password must be different from your current one`,
          path: ['new_password']
        })
        .refine((data) => !twoFactorEnabled || isCompleteOtp(data.totp_code), {
          message: t`Enter the 6-digit code from your authenticator app`,
          path: ['totp_code']
        }),
    [twoFactorEnabled]
  );

  type FormData = z.infer<typeof schema>;

  const EMPTY = React.useMemo<FormData>(
    () => ({
      current_password: '',
      new_password: '',
      confirm_password: '',
      totp_code: ''
    }),
    []
  );

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
    // Required-field errors on blur, not on every keystroke.
    mode: 'onBlur'
  });

  const newPassword = form.watch('new_password');

  const mutation = useMutation({
    mutationFn: (values: FormData) =>
      changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
        ...(twoFactorEnabled ? { totp_code: values.totp_code } : {})
      }),
    onSuccess: (result) => {
      form.reset(EMPTY);
      setSignedOutElsewhere(result.other_sessions_signed_out);
      flash();
      toast.success(lingui`Password updated`);
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        toast.error(lingui`Failed to change password`);
        return;
      }

      // Field-level errors land under the field they belong to. A wrong current
      // password in particular must not wipe the new one just composed.
      switch (error.code) {
        case 'INVALID_CURRENT_PASSWORD':
          form.setError('current_password', { message: error.message });
          form.setFocus('current_password');
          break;
        case 'PASSWORD_UNCHANGED':
          form.setError('new_password', { message: error.message });
          break;
        case 'INVALID_2FA_CODE':
        case 'TOTP_REQUIRED':
          form.setValue('totp_code', '');
          form.setError('totp_code', { message: error.message });
          break;
        default:
          toast.error(error.message);
      }
    }
  });

  const submit = form.handleSubmit((values) => mutation.mutate(values));

  return (
    <ProfileSection
      id="password"
      title={<Trans>Password</Trans>}
      description={
        <Trans>
          Use at least {MIN_PASSWORD_LENGTH} characters. A passphrase of a few
          unrelated words beats a short, complicated one.
        </Trans>
      }
      className={flashClass}
    >
      <ProfileSectionForm
        isDirty
        alwaysEnabled
        isSubmitting={mutation.isPending}
        submitLabel={<Trans>Update password</Trans>}
        onSubmit={() => void submit()}
        onReset={() => form.reset(EMPTY)}
      >
        {/* Never side by side: adjacent password boxes invite typing the new
            one into the current-password field. */}
        <FieldGroup className="max-w-120 gap-5">
          <Controller
            control={form.control}
            name="current_password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-2">
                <FieldLabel htmlFor={field.name}>
                  <Trans>Current password</Trans>
                </FieldLabel>
                <PasswordInput
                  {...field}
                  id={field.name}
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                  onKeyUp={(event) =>
                    setCapsLockOn(event.getModifierState?.('CapsLock') ?? false)
                  }
                />
                {capsLockOn && (
                  <FieldDescription className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                    <TriangleAlertIcon
                      className="size-3.5"
                      aria-hidden="true"
                    />
                    <Trans>Caps Lock is on</Trans>
                  </FieldDescription>
                )}
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="new_password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-2">
                <FieldLabel htmlFor={field.name}>
                  <Trans>New password</Trans>
                </FieldLabel>
                <PasswordInput
                  {...field}
                  id={field.name}
                  autoComplete="new-password"
                  maxLength={MAX_PASSWORD_LENGTH}
                  aria-invalid={fieldState.invalid}
                />
                {/* Live, unlike the other fields: here the feedback helps build
                    the password rather than scolding a finished one. */}
                <PasswordStrengthMeter
                  password={field.value}
                  userInputs={[
                    user.email,
                    user.first_name ?? '',
                    user.last_name ?? ''
                  ].filter(Boolean)}
                  className="pt-1"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="confirm_password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-2">
                <FieldLabel htmlFor={field.name}>
                  <Trans>Confirm new password</Trans>
                </FieldLabel>
                <div className="relative">
                  <PasswordInput
                    {...field}
                    id={field.name}
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                  />
                  {field.value.length > 0 && field.value === newPassword && (
                    <CheckIcon
                      className="pointer-events-none absolute inset-e-9 top-1/2 size-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-500"
                      aria-hidden="true"
                    />
                  )}
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {twoFactorEnabled && (
            <Controller
              control={form.control}
              name="totp_code"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel htmlFor="password-totp">
                    <Trans>Authentication code</Trans>
                  </FieldLabel>
                  <FieldDescription>
                    <Trans>
                      Your account uses two-factor authentication, so changing
                      the password needs a code too.
                    </Trans>
                  </FieldDescription>
                  <OtpField
                    id="password-totp"
                    value={field.value}
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
                    disabled={mutation.isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}

          <Link to="/auth/forgot-password">
            <Trans>Forgot your current password?</Trans>
          </Link>

          {signedOutElsewhere && (
            <p className="flex items-start gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <Trans>
                Your password was changed, so you've been signed out on all
                other devices.
              </Trans>
            </p>
          )}
        </FieldGroup>
      </ProfileSectionForm>
    </ProfileSection>
  );
}
