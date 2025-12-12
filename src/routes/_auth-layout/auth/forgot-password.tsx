import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, Link } from '@tanstack/react-router';
import { CheckIcon, Loader2Icon, MessageCircleIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { forgotPasswordSchema, type ForgotPasswordData } from '@/lib/schemas';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_auth-layout/auth/forgot-password')({
  component: ForgotPasswordPage
});

interface SuccessViewProps {
  email: string;
}

function SuccessView({ email }: SuccessViewProps) {
  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="space-y-4 text-center">
        <div className="inline-block rounded-full bg-green-200 p-2 text-green-800">
          <CheckIcon className="size-8" />
        </div>
        <h1 className="text-2xl font-bold">
          <Trans>Reset link sent</Trans>
        </h1>
        <p className="text-muted-foreground">
          <Trans>
            We&apos;ve sent a password reset email to{' '}
            <span className="font-medium">{email}</span>. Follow the
            instructions to finish resetting your password.
          </Trans>
        </p>
      </div>

      <div className="text-center">
        <Link
          className={cn(
            buttonVariants({
              mode: 'link',
              underline: 'solid'
            }),
            'text-sm text-foreground'
          )}
          to="/auth/login"
        >
          <Trans>Back to login</Trans>
        </Link>
      </div>
    </div>
  );
}

function ForgotPasswordPage() {
  const { t } = useLingui();

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  async function handleSubmit(_data: ForgotPasswordData) {
    try {
      // TODO: Implement API call to send password reset email to _data.email
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success(t`Password reset email sent successfully!`);
    } catch {
      toast.error(t`Failed to send password reset email. Please try again.`);
    }
  }

  const { isSubmitting, isSubmitted } = form.formState;

  if (isSubmitted) {
    return <SuccessView email={form.getValues('email')} />;
  }

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="space-y-2 text-center">
        <div className="inline-block rounded-lg bg-primary p-2 text-white">
          <MessageCircleIcon className="size-10" />
        </div>

        <h1 className="text-2xl font-bold">
          <Trans>Forgot Password</Trans>
        </h1>
        <p className="text-muted-foreground text-balance">
          <Trans>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </Trans>
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="max-w-sm mx-auto space-y-6"
      >
        <FieldSet>
          <FieldGroup className="gap-4">
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
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
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
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Trans>Send reset link</Trans>
        </Button>
      </form>

      <div className="text-center">
        <Link
          className={cn(
            buttonVariants({
              mode: 'link',
              underline: 'solid'
            }),
            'text-sm text-foreground'
          )}
          to="/auth/login"
        >
          <Trans>Back to login</Trans>
        </Link>
      </div>
    </div>
  );
}
