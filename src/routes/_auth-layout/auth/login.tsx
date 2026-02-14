import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import {
  createFileRoute,
  Link,
  redirect,
  useRouter
} from '@tanstack/react-router';
import {
  AlertTriangleIcon,
  Loader2Icon,
  MessageCircleIcon,
  RefreshCwIcon
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { resendVerification } from '@/api/auth';
import { ApiError } from '@/api/client';
import { useAuth } from '@/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { loginSchema } from '@/lib/schemas';

const fallback = '/' as const;

export const Route = createFileRoute('/_auth-layout/auth/login')({
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
  component: LoginPage
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const navigate = Route.useNavigate();
  const { t } = useLingui();
  useDocumentTitle(t`Login`);
  const search = Route.useSearch();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const loginMutation = useMutation({
    mutationFn: auth.login,
    onSuccess: async () => {
      await router.invalidate();
      await navigate({ to: search.redirect || fallback });
      toast.success(t`Successfully logged in!`);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'EMAIL_NOT_VERIFIED') {
        form.setError('root.emailNotVerified', { message: 'emailNotVerified' });
      } else {
        toast.error(t`Failed to login. Please try again.`);
      }
    }
  });

  const resendMutation = useMutation({
    mutationFn: () => resendVerification(form.getValues('email')),
    onSuccess: () => {
      toast.success(t`Verification email resent successfully`);
    },
    onError: () => {
      toast.error(t`Failed to resend verification email`);
    }
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="space-y-2 text-center">
        <div className="inline-block rounded-lg bg-primary p-2 text-white">
          <MessageCircleIcon className="size-10" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold">
          <Trans>Login</Trans>
        </h1>
        <p className="text-muted-foreground">
          {search.redirect ? (
            <Trans>Please login to access this page</Trans>
          ) : (
            <Trans>Enter your credentials to access the dashboard</Trans>
          )}
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-sm mx-auto space-y-6"
      >
        {form.formState.errors.root?.emailNotVerified && (
          <Alert variant="warning">
            <AlertTriangleIcon />
            <AlertTitle>
              <Trans>Email not verified</Trans>
            </AlertTitle>
            <AlertDescription>
              <p>
                <Trans>
                  Please verify your email address before logging in.
                </Trans>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
              >
                {resendMutation.isPending ? (
                  <Loader2Icon className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCwIcon className="mr-2 h-3 w-3" />
                )}
                <Trans>Resend verification email</Trans>
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <FieldSet className="gap-6">
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
                    autoComplete="current-password"
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

        <div className="flex items-center justify-between">
          <Controller
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <Field
                orientation="horizontal"
                className="w-auto items-center gap-2"
              >
                <Checkbox
                  id={field.name}
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  aria-label={t`Remember me`}
                />
                <FieldLabel htmlFor={field.name} className="text-sm">
                  <Trans>Remember me</Trans>
                </FieldLabel>
              </Field>
            )}
          />

          <Link
            to="/auth/forgot-password"
            className={buttonVariants({ variant: 'link' })}
          >
            <Trans>Forgot password?</Trans>
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loginMutation.isPending}
          aria-busy={loginMutation.isPending}
        >
          {loginMutation.isPending && (
            <Loader2Icon
              className="mr-2 h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          )}
          <Trans>Login</Trans>
        </Button>
      </form>

      <div className="flex items-center justify-center">
        <p className="text-sm text-muted-foreground -mt-2">
          <Trans>Don't have an account?</Trans>{' '}
          <Button
            variant="link"
            size="sm"
            render={
              <Link to="/auth/sign-up">
                <Trans>Sign up</Trans>
              </Link>
            }
          />
        </p>
      </div>
    </div>
  );
}
