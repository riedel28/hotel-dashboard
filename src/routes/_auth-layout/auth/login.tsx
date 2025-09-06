import { useAuth } from '@/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import {
  Link,
  createFileRoute,
  redirect,
  useRouter
} from '@tanstack/react-router';
import { Loader2, MessageCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
    onError: () => {
      toast.error(t`Failed to login. Please try again.`);
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md space-y-8">
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans>Email</Trans>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    variant="lg"
                    placeholder={t`Enter your email`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans>Password</Trans>
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    variant="lg"
                    placeholder={t`Enter your password`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    <Trans>Remember me</Trans>
                  </FormLabel>
                </FormItem>
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
      </Form>
    </div>
  );
}
