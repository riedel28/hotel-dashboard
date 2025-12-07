import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, Link } from '@tanstack/react-router';
import { CheckIcon, Loader2, MessageCircleIcon } from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from '@/components/ui/item';

import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_auth-layout/auth/forgot-password')({
  component: ForgotPasswordPage
});

type ForgotPasswordFormData = { email: string };

function ForgotPasswordPage() {
  const { t } = useLingui();
  const [submittedEmail, setSubmittedEmail] = React.useState<string | null>(
    null
  );

  const forgotPasswordFormSchema = z.object({
    email: z.email(t`Email is required`)
  });

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // TODO: Implement API call to send password reset email
      console.log('Sending password reset email to:', data.email);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setSubmittedEmail(data.email);
      toast.success(t`Password reset email sent successfully!`);
    } catch (error) {
      console.error('Error sending password reset email: ', error);
      toast.error(t`Failed to send password reset email. Please try again.`);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  if (submittedEmail) {
    return (
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-2 text-center">
          <div className="inline-block rounded-lg bg-primary p-2 text-white">
            <MessageCircleIcon className="size-10" />
          </div>
          <h1 className="text-2xl font-bold">
            <Trans>Forgot Password</Trans>
          </h1>
          <p className="text-muted-foreground">
            <Trans>Check your inbox for the password reset link</Trans>
          </p>
        </div>

        <Item
          variant="muted"
          className="border border-green-200 bg-green-50 text-green-900 shadow-none"
        >
          <ItemMedia variant="icon" className="bg-green-200 text-green-800">
            <CheckIcon className="size-4" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="text-green-900">
              <Trans>Reset link sent</Trans>
            </ItemTitle>
            <ItemDescription className="text-green-900/90">
              <Trans>
                We&apos;ve sent a password reset email to{' '}
                <span className="font-medium text-green-900">
                  {submittedEmail}
                </span>
                . Follow the instructions to finish resetting your password.
              </Trans>
            </ItemDescription>
          </ItemContent>
        </Item>

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

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="space-y-2 text-center">
        <div className="inline-block rounded-lg bg-primary p-2 text-white">
          <MessageCircleIcon className="size-10" />
        </div>

        <h1 className="text-2xl font-bold">
          <Trans>Forgot Password</Trans>
        </h1>
        <p className="text-muted-foreground">
          <Trans>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </Trans>
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
