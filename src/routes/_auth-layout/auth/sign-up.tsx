import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import {
  CheckIcon,
  Loader2Icon,
  MessageCircleIcon,
  RefreshCwIcon
} from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { resendVerification, signUp } from '@/api/auth';
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
import { registerSchema } from '@/lib/schemas';

const fallback = '/' as const;

export const Route = createFileRoute('/_auth-layout/auth/sign-up')({
  validateSearch: z.object({
    redirect: z
      .string()
      .optional()
      .catch('')
      .transform((val) => {
        if (!val || !val.startsWith('/') || val.startsWith('//')) return '';
        return val;
      })
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || fallback });
    }
  },
  component: SignUpPage
});

type SignUpFormValues = z.infer<typeof registerSchema>;

interface SuccessViewProps {
  email: string;
}

function SuccessView({ email }: SuccessViewProps) {
  const { t } = useLingui();

  const resendMutation = useMutation({
    mutationFn: () => resendVerification(email),
    onSuccess: () => {
      toast.success(t`Verification email resent successfully`);
    },
    onError: () => {
      toast.error(t`Failed to resend verification email`);
    }
  });

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="space-y-4 text-center">
        <div className="inline-block rounded-full bg-green-200 p-2 text-green-800">
          <CheckIcon className="size-7" />
        </div>
        <h1 className="text-2xl font-bold">
          <Trans>Check your email</Trans>
        </h1>
        <p className="text-muted-foreground text-balance">
          <Trans>
            We&apos;ve sent a verification email to{' '}
            <span className="font-medium">{email}</span>. Click the link in the
            email to verify your account.
          </Trans>
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => resendMutation.mutate()}
          disabled={resendMutation.isPending}
        >
          {resendMutation.isPending ? (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCwIcon className="mr-2 h-4 w-4" />
          )}
          <Trans>Resend verification email</Trans>
        </Button>
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

function SignUpPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Sign Up`);
  const [successEmail, setSuccessEmail] = React.useState<string | null>(null);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      password: ''
    }
  });

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      setSuccessEmail(form.getValues('email'));
    },
    onError: (error) => {
      toast.error(
        error.message || t`Failed to create account. Please try again.`
      );
    }
  });

  function handleSubmit(data: SignUpFormValues) {
    signUpMutation.mutate(data);
  }

  if (successEmail) {
    return <SuccessView email={successEmail} />;
  }

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="space-y-2 text-center">
        <div className="inline-block rounded-lg bg-primary p-2 text-white">
          <MessageCircleIcon className="size-10" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold">
          <Trans>Sign Up</Trans>
        </h1>
        <p className="text-muted-foreground">
          <Trans>Create an account to access the dashboard</Trans>
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(handleSubmit)}
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
                    aria-required="true"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
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
                    aria-required="true"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel htmlFor={field.name}>
                    <Trans>Email</Trans>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    placeholder={t`Enter your email`}
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
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
                    aria-required="true"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
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
          disabled={signUpMutation.isPending}
          aria-busy={signUpMutation.isPending}
        >
          {signUpMutation.isPending && (
            <Loader2Icon
              className="mr-2 h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          )}
          <Trans>Sign Up</Trans>
        </Button>
      </form>

      <div className="flex items-center justify-center">
        <p className="text-sm text-muted-foreground -mt-2">
          <Trans>Already have an account?</Trans>{' '}
          <Button
            variant="link"
            size="sm"
            render={
              <Link to="/auth/login">
                <Trans>Login</Trans>
              </Link>
            }
          />
        </p>
      </div>
    </div>
  );
}
