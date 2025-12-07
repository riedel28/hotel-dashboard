import { useAuth } from '@/auth';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import {
  Link,
  createFileRoute,
  redirect,
  useRouter
} from '@tanstack/react-router';
import { CheckIcon, CopyIcon, Loader2, MessageCircleIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle
} from '@/components/ui/item';
import { PasswordInput } from '@/components/ui/password-input';

import { loginSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

const fallback = '/' as const;

export const Route = createFileRoute('/_auth-layout/auth/login')({
  validateSearch: z.object({
    redirect: z.string().optional().catch('')
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
  const loginCopy = useCopyToClipboard();
  const passwordCopy = useCopyToClipboard();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'john@example.com',
      password: 'very_cool_password',
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

      <Item
        variant="muted"
        className="border border-blue-200 bg-blue-50 text-blue-900 shadow-none"
      >
        <ItemContent>
          <ItemTitle className="text-blue-900">
            <Trans>Demo credentials</Trans>
          </ItemTitle>
          <ItemDescription className="text-blue-900/90">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Trans>
                  Login: <span className="font-medium">john@example.com</span>
                </Trans>
                <Button
                  type="button"
                  mode="icon"
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-blue-900 opacity-70 hover:bg-blue-100 hover:opacity-100"
                  onClick={() => {
                    loginCopy.copy('john@example.com');
                  }}
                >
                  {loginCopy.copied ? (
                    <CheckIcon className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <CopyIcon className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Trans>
                  Password:{' '}
                  <span className="font-medium">very_cool_password</span>
                </Trans>
                <Button
                  type="button"
                  mode="icon"
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-blue-900 opacity-70 hover:bg-blue-100 hover:opacity-100"
                  onClick={() => {
                    passwordCopy.copy('very_cool_password');
                  }}
                >
                  {passwordCopy.copied ? (
                    <CheckIcon className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <CopyIcon className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </ItemDescription>
        </ItemContent>
      </Item>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <FieldLabel
                  htmlFor={field.name}
                  className="text-sm font-normal"
                >
                  <Trans>Remember me</Trans>
                </FieldLabel>
              </Field>
            )}
          />

          <Link
            className={cn(
              buttonVariants({
                mode: 'link',
                underline: 'solid'
              }),
              'text-sm text-foreground'
            )}
            to="/auth/forgot-password"
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
    </div>
  );
}
