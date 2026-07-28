import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckIcon, TriangleAlertIcon } from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { resendVerification } from '@/api/auth';
import { ApiError } from '@/api/client';
import { profileKeys, updateMe } from '@/api/profile';
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
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

/** The editable subset of a user, in the shape the form holds it. */
function toFormValues(user: User) {
  return {
    first_name: user.first_name ?? '',
    last_name: user.last_name ?? '',
    country_code: user.country_code ?? null
  };
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
    () => toFormValues(user),
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
      form.reset(toFormValues(updated));
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

  // `handleSubmit` hands back a new function every render, so the handle is
  // read through a ref — registering the closure directly would re-run the
  // effect below on every single render.
  const latestSubmit = React.useRef(submit);
  latestSubmit.current = submit;

  const save = React.useCallback(() => void latestSubmit.current(), []);

  React.useEffect(() => {
    registerControls({ save, reset: resetForm });
  }, [registerControls, save, resetForm]);

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
        onSubmit={save}
        onReset={resetForm}
      >
        <AvatarField user={user} />

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
  const { t } = useLingui();

  const resend = useMutation({
    mutationFn: () => resendVerification(user.email),
    onSuccess: () => toast.success(t`Verification email sent`),
    onError: () => toast.error(t`Couldn't send the email. Try again.`)
  });

  const verified = user.email_verified;

  return (
    <Field className="gap-2">
      <FieldLabel htmlFor="profile-email">
        <Trans>Email</Trans>
      </FieldLabel>
      {/* The control is disabled, but the group must not fade with it — the
          verification mark in the addon is the one thing here worth reading. */}
      <InputGroup className="has-disabled:opacity-100">
        <InputGroupInput
          id="profile-email"
          type="email"
          value={user.email}
          readOnly
          disabled
          autoComplete="email"
        />
        <InputGroupAddon align="inline-end">
          <Tooltip>
            <TooltipTrigger
              type="button"
              aria-label={verified ? t`Email verified` : t`Email not verified`}
              className={cn(
                // A square box is what makes rounded-full a circle; without it
                // the button shrink-wraps the glyph and comes out as a pill.
                'flex bg-transparent size-4 shrink-0 items-center justify-center rounded-full text-white mr-1',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'
              )}
            >
              {verified ? (
                <CheckIcon
                  className="size-4 text-emerald-500"
                  strokeWidth={3}
                  aria-hidden="true"
                />
              ) : (
                <TriangleAlertIcon
                  className="size-4 text-amber-700 dark:text-amber-500"
                  aria-hidden="true"
                />
              )}
            </TooltipTrigger>
            <TooltipContent>
              {verified ? (
                <Trans>This address is verified.</Trans>
              ) : (
                <Trans>
                  This address isn't verified yet. Check your inbox for the
                  confirmation link.
                </Trans>
              )}
            </TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
      <FieldDescription className="flex flex-wrap items-center gap-x-2">
        {!verified && (
          <span className="flex items-center gap-x-2">
            <Trans>Not verified yet.</Trans>
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
          </span>
        )}
        <span>
          <Trans>To change your email, contact your administrator.</Trans>
        </span>
      </FieldDescription>
    </Field>
  );
}
