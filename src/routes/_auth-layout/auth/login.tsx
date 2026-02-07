import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import {
  createFileRoute,
  Link,
  redirect,
  useRouter
} from '@tanstack/react-router';
import { Loader2, MessageCircleIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuth } from '@/auth';

import { Button } from '@/components/ui/button';
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

import { loginSchema } from '@/lib/schemas';

const fallback = '/' as const;

export const Route = createFileRoute('/_auth-layout/auth/login')({
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
  component: LoginPage
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const navigate = Route.useNavigate();
  const { t } = useLingui();

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
      await navigate({ to: search.redirect || '' });
      toast.success(t`Successfully logged in!`);
    },
    onError: () => {
      toast.error(t`Failed to login. Please try again.`);
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="space-y-2 text-center">
        <div className="inline-block rounded-lg bg-primary p-2 text-white">
          <MessageCircleIcon className="size-10" />
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
                    autoComplete="current-password"
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
                />
                <FieldLabel htmlFor={field.name} className="text-sm">
                  <Trans>Remember me</Trans>
                </FieldLabel>
              </Field>
            )}
          />

          <Link
            to="/auth/forgot-password"
            className="text-primary hover:underline underline-offset-4 font-medium text-sm"
          >
            <Trans>Forgot password?</Trans>
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
