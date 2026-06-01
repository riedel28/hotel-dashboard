import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/ui/link';
import { PasswordInput } from '@/components/ui/password-input';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { registerSchema } from '@/lib/schemas';

const fallback = '/' as const;

export const Route = createFileRoute('/_auth-layout/auth/sign-up')({
  validateSearch: z.object({
    redirect: z
      .string()
      .optional()
      .catch(undefined)
      .transform((val) => {
        if (!val || !val.startsWith('/') || val.startsWith('//'))
          return undefined;
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
    <div className="flex flex-1 items-center justify-center py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="space-y-4 text-center">
          <div className="inline-flex rounded-full bg-green-200 p-2 text-green-800">
            <CheckIcon className="size-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold">
            <Trans>Check your email</Trans>
          </h1>
          <p className="text-muted-foreground text-balance">
            <Trans>
              We&apos;ve sent a verification email to{' '}
              <span className="font-medium">{email}</span>. Click the link in
              the email to verify your account.
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
          <Link to="/auth/login">
            <Trans>Back to login</Trans>
          </Link>
        </div>
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

  const onSubmit = (data: SignUpFormValues) => {
    signUpMutation.mutate(data);
  };

  if (successEmail) {
    return <SuccessView email={successEmail} />;
  }

  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <div className="flex w-full max-w-sm flex-col gap-5">
        <div className="flex flex-col items-start gap-4 mb-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-cyan-950 dark:text-cyan-200/90 text-sm font-bold text-primary">
            <MessageCircleIcon aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold">
              <Trans>Sign Up</Trans>
            </h1>
            <p className="text-sm text-muted-foreground">
              <Trans>Create an account to access the dashboard</Trans>
            </p>
          </div>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full max-w-sm flex-col gap-5"
        >
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

          <Button
            type="submit"
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

        <p className="text-sm text-muted-foreground text-center">
          <Trans>Already have an account?</Trans>{' '}
          <Link to="/auth/login">
            <Trans>Login</Trans>
          </Link>
        </p>
      </div>
    </div>
  );
}
