import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  CheckIcon,
  Loader2Icon,
  MessageCircleIcon,
  XCircleIcon
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { acceptInvitation } from '@/api/auth';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { strongPasswordSchema } from '@/lib/schemas';

const acceptInvitationSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required').max(50),
    last_name: z.string().min(1, 'Last name is required').max(50),
    password: strongPasswordSchema,
    confirm_password: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password']
  });

type AcceptInvitationFormValues = z.infer<typeof acceptInvitationSchema>;

export const Route = createFileRoute('/_auth-layout/auth/accept-invitation')({
  validateSearch: z.object({
    token: z.string().optional()
  }),
  component: AcceptInvitationPage
});

function AcceptInvitationPage() {
  const { token } = Route.useSearch();
  const { t } = useLingui();
  useDocumentTitle(t`Accept Invitation`);

  const form = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      password: '',
      confirm_password: ''
    }
  });

  const acceptMutation = useMutation({
    mutationFn: (data: AcceptInvitationFormValues) =>
      acceptInvitation({
        token: token || '',
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name
      }),
    onError: () => {
      toast.error(t`Failed to activate account. The link may have expired.`);
    }
  });

  if (!token) {
    return (
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-4 text-center">
          <div className="inline-block rounded-full bg-red-200 p-2 text-red-800">
            <XCircleIcon className="size-7" />
          </div>
          <h1 className="text-2xl font-bold">
            <Trans>Invalid link</Trans>
          </h1>
          <p className="text-muted-foreground">
            <Trans>This invitation link is invalid.</Trans>
          </p>
        </div>
        <div className="text-center">
          <Link
            to="/auth/login"
            className="text-primary hover:underline underline-offset-4 font-medium text-sm"
          >
            <Trans>Back to login</Trans>
          </Link>
        </div>
      </div>
    );
  }

  if (acceptMutation.isSuccess) {
    return (
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-4 text-center">
          <div className="inline-block rounded-full bg-green-200 p-2 text-green-800">
            <CheckIcon className="size-7" />
          </div>
          <h1 className="text-2xl font-bold">
            <Trans>Account activated!</Trans>
          </h1>
          <p className="text-muted-foreground">
            <Trans>
              Your account has been activated. You can now log in with your
              password.
            </Trans>
          </p>
        </div>
        <div className="text-center">
          <Button
            render={
              <Link to="/auth/login">
                <Trans>Go to login</Trans>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="space-y-2 text-center">
        <div className="inline-block rounded-lg bg-primary p-2 text-white">
          <MessageCircleIcon className="size-10" />
        </div>

        <h1 className="text-2xl font-bold">
          <Trans>Accept Invitation</Trans>
        </h1>
        <p className="text-muted-foreground">
          <Trans>Set your password to activate your account</Trans>
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit((data) => acceptMutation.mutate(data))}
        className="max-w-sm mx-auto space-y-6"
      >
        <FieldSet className="gap-6">
          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="first_name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel htmlFor={field.name}>
                    <Trans>First Name</Trans>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    placeholder={t`Enter your first name`}
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
                    <Trans>Last Name</Trans>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    placeholder={t`Enter your last name`}
                    autoComplete="family-name"
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
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel htmlFor={field.name}>
                    <Trans>Password</Trans>
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id={field.name}
                    placeholder={t`Enter your password`}
                    autoComplete="new-password"
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
              name="confirm_password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel htmlFor={field.name}>
                    <Trans>Confirm Password</Trans>
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id={field.name}
                    placeholder={t`Confirm your password`}
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={acceptMutation.isPending}
        >
          {acceptMutation.isPending && (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Trans>Activate Account</Trans>
        </Button>
      </form>

      <div className="text-center -mt-2">
        <Button
          variant="link"
          size="sm"
          render={
            <Link to="/auth/login">
              <Trans>Back to login</Trans>
            </Link>
          }
        />
      </div>
    </div>
  );
}
