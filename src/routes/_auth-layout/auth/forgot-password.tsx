import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { CheckIcon, Loader2Icon, MessageCircleIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type z from 'zod';
import { forgotPassword } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/ui/link';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { loginSchema } from '@/lib/schemas';

const forgotPasswordSchema = loginSchema.pick({ email: true });
type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const Route = createFileRoute('/_auth-layout/auth/forgot-password')({
  component: ForgotPasswordPage
});

interface SuccessViewProps {
  email: string;
}

function SuccessView({ email }: SuccessViewProps) {
  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <div className="flex w-full max-w-sm flex-col gap-5">
        <div className="flex flex-col items-center gap-4 mb-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-green-900 dark:text-green-200/90 text-sm font-bold text-emerald-600">
            <CheckIcon aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold text-center">
              <Trans>Reset link sent</Trans>
            </h1>
            <p className="text-sm text-muted-foreground text-pretty text-center">
              <Trans>
                We&apos;ve sent password reset instructions to {email}
              </Trans>
            </p>
            <p className="text-sm text-muted-foreground text-pretty text-center">
              <Trans>
                Please check your inbox and follow the instructions to reset
                your password.
              </Trans>
            </p>
          </div>
        </div>

        <Link to="/auth/login" className="text-center">
          <Trans>Back to login</Trans>
        </Link>
      </div>
    </div>
  );
}

function ForgotPasswordPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Forgot Password`);

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const forgotMutation = useMutation({
    mutationFn: (data: ForgotPasswordData) => forgotPassword(data.email),
    onSuccess: () => {
      toast.success(t`Password reset email sent successfully!`);
    },
    onError: () => {
      toast.error(t`Failed to send password reset email. Please try again.`);
    }
  });

  if (forgotMutation.isSuccess) {
    return <SuccessView email={form.getValues('email')} />;
  }

  const onSubmit = (data: ForgotPasswordData) => {
    forgotMutation.mutate(data);
  };

  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <div className="flex w-full max-w-sm flex-col gap-5">
        <div className="flex flex-col items-start gap-4 mb-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-cyan-950 dark:text-cyan-200/90 text-sm font-bold text-primary">
            <MessageCircleIcon aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold">
              <Trans>Forgot Password</Trans>
            </h1>
            <p className="text-sm text-muted-foreground text-balance">
              <Trans>
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </Trans>
            </p>
          </div>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full max-w-sm flex-col gap-5"
        >
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
                  disabled={forgotMutation.isPending}
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
            disabled={forgotMutation.isPending}
            aria-busy={forgotMutation.isPending}
          >
            {forgotMutation.isPending && (
              <Loader2Icon
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            <Trans>Send reset link</Trans>
          </Button>
        </form>

        <Link to="/auth/login" className="text-center">
          <Trans>Back to login</Trans>
        </Link>
      </div>
    </div>
  );
}
