import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import {
  AlertTriangleIcon,
  Loader2Icon,
  MessageCircleIcon,
  RefreshCwIcon,
  ShieldCheckIcon
} from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { resendVerification } from '@/api/auth';
import { ApiError } from '@/api/client';
import { useAuth } from '@/auth';
import { OtpField } from '@/components/otp-field';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/ui/link';
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

  const [challengeToken, setChallengeToken] = useState<string | null>(null);

  const finishSignIn = async () => {
    await router.invalidate();
    await navigate({ to: search.redirect || fallback });
    toast.success(t`Successfully logged in!`);
  };

  const loginMutation = useMutation({
    mutationFn: auth.login,
    onSuccess: async (result) => {
      if (result.status === 'two-factor-required') {
        setChallengeToken(result.challengeToken);
        return;
      }
      await finishSignIn();
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

  // Password accepted, second factor outstanding. The password form is replaced
  // rather than extended, so there's one thing to do on screen at a time.
  if (challengeToken) {
    return (
      <TwoFactorStep
        challengeToken={challengeToken}
        rememberMe={form.getValues('rememberMe') ?? false}
        onCancel={() => setChallengeToken(null)}
        onComplete={finishSignIn}
      />
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <div className="flex w-full max-w-sm flex-col gap-5">
        <div className="flex flex-col items-start gap-4 mb-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-cyan-950 dark:text-cyan-200/90 text-sm font-bold text-primary">
            <MessageCircleIcon />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold">
              <Trans>Login</Trans>
            </h1>
            <p className="text-sm text-muted-foreground">
              <Trans>
                Enter your email and password to access the dashboard
              </Trans>
            </p>
          </div>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full max-w-sm flex-col gap-5"
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

          <div className="flex items-center justify-between gap-4">
            <Controller
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <Field
                  orientation="horizontal"
                  className="flex items-center gap-2 w-auto"
                >
                  <Checkbox
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    aria-label={t`Remember me`}
                  />
                  <FieldLabel
                    htmlFor={field.name}
                    className="cursor-pointer text-sm font-normal"
                  >
                    <Trans>Remember me</Trans>
                  </FieldLabel>
                </Field>
              )}
            />

            <Link to="/auth/forgot-password">
              <Trans>Forgot password?</Trans>
            </Link>
          </div>

          <Button
            type="submit"
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

        <p className="text-sm text-muted-foreground text-center">
          Don't have an account? <Link to="/auth/sign-up">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

/**
 * Second step of a 2FA sign-in. Accepts a code from the authenticator app, or a
 * recovery code for the case the phone is lost — without that escape hatch,
 * enabling 2FA would be a way to lock yourself out permanently.
 */
function TwoFactorStep({
  challengeToken,
  rememberMe,
  onCancel,
  onComplete
}: {
  challengeToken: string;
  rememberMe: boolean;
  onCancel: () => void;
  onComplete: () => Promise<void>;
}) {
  const auth = useAuth();
  const { t } = useLingui();
  const [code, setCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      auth.completeTwoFactorLogin({ challengeToken, code, rememberMe }),
    onSuccess: () => void onComplete(),
    onError: (caught) => {
      setCode('');
      if (caught instanceof ApiError && caught.code === 'CHALLENGE_EXPIRED') {
        toast.error(t`That sign-in attempt expired. Please start again.`);
        onCancel();
        return;
      }
      setError(
        caught instanceof Error
          ? caught.message
          : t`That code isn't valid. Check your app and try again.`
      );
    }
  });

  const canSubmit = useRecoveryCode
    ? /^[a-z0-9]{4}-[a-z0-9]{4}$/.test(code.trim())
    : /^\d{6}$/.test(code);

  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <div className="flex w-full max-w-sm flex-col gap-5">
        <div className="mb-3 flex flex-col items-start gap-4">
          <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg dark:bg-cyan-950 dark:text-cyan-200/90">
            <ShieldCheckIcon />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold">
              <Trans>Two-step verification</Trans>
            </h1>
            <p className="text-muted-foreground text-sm">
              {useRecoveryCode ? (
                <Trans>Enter one of your unused recovery codes.</Trans>
              ) : (
                <Trans>
                  Enter the 6-digit code from your authenticator app.
                </Trans>
              )}
            </p>
          </div>
        </div>

        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            mutation.mutate();
          }}
        >
          <Field data-invalid={Boolean(error)} className="gap-2">
            {useRecoveryCode ? (
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value.toLowerCase())}
                placeholder="a1b2-c3d4"
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
                aria-invalid={Boolean(error)}
                aria-label={t`Recovery code`}
              />
            ) : (
              <OtpField
                value={code}
                onChange={(next) => {
                  setCode(next);
                  if (error) setError(null);
                }}
                onComplete={() => mutation.mutate()}
                invalid={Boolean(error)}
                disabled={mutation.isPending}
                autoFocus
              />
            )}
            {error && <FieldError errors={[{ message: error }]} />}
          </Field>

          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit || mutation.isPending}
            aria-busy={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2Icon
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            <Trans>Verify</Trans>
          </Button>
        </form>

        <div className="flex flex-col items-center gap-1 text-sm">
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setUseRecoveryCode((value) => !value);
              setCode('');
              setError(null);
            }}
          >
            {useRecoveryCode ? (
              <Trans>Use a code from my app instead</Trans>
            ) : (
              <Trans>I don't have my phone</Trans>
            )}
          </Button>
          <Button variant="link" size="sm" onClick={onCancel}>
            <Trans>Back to sign in</Trans>
          </Button>
        </div>
      </div>
    </div>
  );
}
