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
import { ProfileSection, ProfileSectionForm } from './profile-section';

interface PersonalSectionProps {
  user: User;
}

/** The editable subset of a user, in the shape the form holds it. */
function toFormValues(user: User) {
  return {
    first_name: user.first_name ?? '',
    last_name: user.last_name ?? '',
    country_code: user.country_code ?? null
  };
}

export function PersonalSection({ user }: PersonalSectionProps) {
  const { t: lingui } = useLingui();
  const queryClient = useQueryClient();
  const [conflictOpen, setConflictOpen] = React.useState(false);

  const schema = React.useMemo(
    () =>
      z.object({
        first_name: z
          .string()
          .trim()
          .min(1, t`First name is required`)
          .max(50),
        last_name: z
          .string()
          .trim()
          .min(1, t`Last name is required`)
          .max(50),
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

  const mutation = useMutation({
    mutationFn: (values: FormData) =>
      updateMe({ ...values, expected_updated_at: user.updated_at }),
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKeys.me, updated);
      form.reset(toFormValues(updated));
      toast.success(lingui`Profile updated`);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'STALE_PROFILE') {
        setConflictOpen(true);
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : lingui`Failed to update profile`
      );
    }
  });

  const submit = form.handleSubmit((values) => mutation.mutate(values));

  return (
    <ProfileSection
      id="profile"
      title={<Trans>Personal details</Trans>}
      description={<Trans>How you appear across the back-office.</Trans>}
    >
      <ProfileSectionForm
        isDirty={form.formState.isDirty}
        isSubmitting={mutation.isPending}
        submitLabel={<Trans>Save changes</Trans>}
        onSubmit={() => void submit()}
        onReset={() => reset(defaults)}
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

          <div className="grid gap-4 @md/section:grid-cols-2">
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
            <AlertDialogCancel>
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
      {/* Read-only rather than disabled, styled like the check-in page's
          guest link: grey in light, sunk below the card in dark, and the
          address at full contrast instead of faded. */}
      <InputGroup className="bg-muted/50 dark:border-border dark:bg-background/60">
        <InputGroupInput
          id="profile-email"
          type="email"
          value={user.email}
          readOnly
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
                'mr-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-transparent text-white',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'
              )}
            >
              {verified ? (
                <CheckIcon
                  className="size-4 text-success"
                  strokeWidth={3}
                  aria-hidden="true"
                />
              ) : (
                <TriangleAlertIcon
                  className="size-4 text-warning"
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
