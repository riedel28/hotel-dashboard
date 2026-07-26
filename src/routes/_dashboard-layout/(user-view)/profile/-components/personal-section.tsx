import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeCheckIcon, TriangleAlertIcon } from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { resendVerification } from '@/api/auth';
import { ApiError } from '@/api/client';
import { profileKeys, updateMe } from '@/api/profile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CountryPicker } from '@/components/ui/country-picker';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { User } from '../../../../../../shared/types/users';
import { AvatarField } from './avatar-field';
import {
  ProfileSection,
  ProfileSectionForm,
  useSuccessFlash
} from './profile-section';

interface PersonalSectionProps {
  user: User;
  onDirtyChange: (dirty: boolean) => void;
  onSavingChange: (saving: boolean) => void;
  /** Registers a save/reset handle so the mobile bottom bar can drive this form. */
  registerControls: (controls: { save: () => void; reset: () => void }) => void;
  onConflict: () => void;
}

export function PersonalSection({
  user,
  onDirtyChange,
  onSavingChange,
  registerControls,
  onConflict
}: PersonalSectionProps) {
  const { t: lingui } = useLingui();
  const queryClient = useQueryClient();
  const { flash, flashClass } = useSuccessFlash();

  const schema = React.useMemo(
    () =>
      z.object({
        first_name: z.string().trim().min(1, t`First name is required`).max(50),
        last_name: z.string().trim().min(1, t`Last name is required`).max(50),
        country_code: z.string().length(2).nullable()
      }),
    []
  );

  type FormData = z.infer<typeof schema>;

  const defaults: FormData = React.useMemo(
    () => ({
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      country_code: user.country_code ?? null
    }),
    [user.first_name, user.last_name, user.country_code]
  );

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    // Required fields shouldn't turn red while the user is still typing.
    mode: 'onBlur'
  });

  const { reset } = form;
  React.useEffect(() => reset(defaults), [defaults, reset]);

  const isDirty = form.formState.isDirty;
  React.useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange]);

  const mutation = useMutation({
    mutationFn: (values: FormData) =>
      updateMe({ ...values, expected_updated_at: user.updated_at }),
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKeys.me, updated);
      form.reset({
        first_name: updated.first_name ?? '',
        last_name: updated.last_name ?? '',
        country_code: updated.country_code ?? null
      });
      flash();
      toast.success(lingui`Profile updated`);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'STALE_PROFILE') {
        onConflict();
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : lingui`Failed to update profile`
      );
    }
  });

  const isSaving = mutation.isPending;
  React.useEffect(() => onSavingChange(isSaving), [isSaving, onSavingChange]);

  const submit = form.handleSubmit((values) => mutation.mutate(values));
  const resetForm = React.useCallback(() => reset(defaults), [defaults, reset]);

  React.useEffect(() => {
    registerControls({ save: () => void submit(), reset: resetForm });
  }, [registerControls, submit, resetForm]);

  return (
    <ProfileSection
      id="profile"
      title={<Trans>Profile</Trans>}
      description={<Trans>How you appear across the back-office.</Trans>}
      className={flashClass}
    >
      <ProfileSectionForm
        isDirty={isDirty}
        isSubmitting={mutation.isPending}
        submitLabel={<Trans>Save changes</Trans>}
        onSubmit={() => void submit()}
        onReset={resetForm}
      >
        <AvatarField user={user} />

        <Separator />

        <FieldGroup className="gap-4">
          {/* Two across even on tablet — a name pair reads as one thing, and
              stacking it wastes the width these screens do have. */}
          <div className="grid gap-4 @md/section:grid-cols-2">
            <Controller
              control={form.control}
              name="first_name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel htmlFor={field.name}>
                    <Trans>First name</Trans>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    autoComplete="given-name"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="last_name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel htmlFor={field.name}>
                    <Trans>Last name</Trans>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    autoComplete="family-name"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="grid gap-4 @md/section:grid-cols-[2fr_1fr]">
            <EmailField user={user} />

            <Controller
              control={form.control}
              name="country_code"
              render={({ field }) => (
                <Field className="gap-2">
                  <FieldLabel htmlFor="country_code">
                    <Trans>Country</Trans>
                  </FieldLabel>
                  <CountryPicker
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                  />
                </Field>
              )}
            />
          </div>
        </FieldGroup>
      </ProfileSectionForm>
    </ProfileSection>
  );
}

/**
 * Read-only. Changing the address a person signs in with is an account-recovery
 * flow, not a text field — it needs verification on the new address and a
 * warning to the old one, neither of which exists yet.
 */
function EmailField({ user }: { user: User }) {
  const { t: lingui } = useLingui();

  const resend = useMutation({
    mutationFn: () => resendVerification(user.email),
    onSuccess: () => toast.success(lingui`Verification email sent`),
    onError: () => toast.error(lingui`Couldn't send the email. Try again.`)
  });

  return (
    <Field className="gap-2">
      <FieldLabel htmlFor="profile-email">
        <Trans>Email</Trans>
      </FieldLabel>
      <Input
        id="profile-email"
        type="email"
        value={user.email}
        readOnly
        disabled
        autoComplete="email"
      />
      <FieldDescription className="flex flex-wrap items-center gap-2">
        {user.email_verified ? (
          <Badge color="emerald" size="xs" className="gap-1 py-0.5">
            <BadgeCheckIcon aria-hidden="true" />
            <Trans>Verified</Trans>
          </Badge>
        ) : (
          <>
            <Badge color="yellow" size="xs" className="gap-1 py-0.5">
              <TriangleAlertIcon aria-hidden="true" />
              <Trans>Unverified</Trans>
            </Badge>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() => resend.mutate()}
              disabled={resend.isPending}
            >
              <Trans>Resend</Trans>
            </Button>
          </>
        )}
        <span>
          <Trans>To change your email, contact your administrator.</Trans>
        </span>
      </FieldDescription>
    </Field>
  );
}
