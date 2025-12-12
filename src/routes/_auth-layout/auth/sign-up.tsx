import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import {
  createFileRoute,
  Link,
  redirect,
  useRouter
} from '@tanstack/react-router';
import { Loader2Icon, MessageCircleIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuth } from '@/auth';

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

import { registerSchema } from '@/lib/schemas';

const fallback = '/' as const;

export const Route = createFileRoute('/_auth-layout/auth/sign-up')({
  validateSearch: z.object({
    redirect: z.string().optional().catch('')
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || fallback });
    }
  },
  component: SignUpPage
});

type SignUpFormValues = z.infer<typeof registerSchema>;

function SignUpPage() {
  const auth = useAuth();
  const router = useRouter();
  const navigate = Route.useNavigate();
  const { t } = useLingui();

  const search = Route.useSearch();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      password: ''
    }
  });

  const registerMutation = useMutation({
    mutationFn: auth.register,
    onSuccess: async () => {
      await router.invalidate();
      await navigate({ to: search.redirect || fallback });
      toast.success(t`Successfully registered!`);
    },
    onError: () => {
      toast.error(t`Failed to register. Please try again.`);
    }
  });

  function handleSubmit(data: SignUpFormValues) {
    registerMutation.mutate(data);
  }

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="space-y-2 text-center">
        <div className="inline-block rounded-lg bg-primary p-2 text-white">
          <MessageCircleIcon className="size-10" />
        </div>

        <h1 className="text-2xl font-bold">
          <Trans>Sign Up</Trans>
        </h1>
        <p className="text-muted-foreground">
          {search.redirect ? (
            <Trans>Please create an account to access this page</Trans>
          ) : (
            <Trans>Create an account to access the dashboard</Trans>
          )}
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
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending && (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Trans>Sign Up</Trans>
        </Button>
      </form>

      <div className="flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          <Trans>Already have an account?</Trans>{' '}
          <Link
            to="/auth/login"
            className="text-primary hover:underline underline-offset-4 font-medium text-sm"
          >
            <Trans>Login</Trans>
          </Link>
        </p>
      </div>
    </div>
  );
}
