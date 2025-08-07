import { useAuth } from '@/auth';
import { sleep } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Link,
  createFileRoute,
  redirect,
  useRouter,
  useRouterState
} from '@tanstack/react-router';
import { MessageCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
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

type LoginFormValues = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const navigate = Route.useNavigate();
  const intl = useIntl();

  const search = Route.useSearch();

  const loginFormSchema = z.object({
    email: z
      .string()
      .min(
        1,
        intl.formatMessage({
          id: 'validation.email.required',
          defaultMessage: 'Email is required'
        })
      )
      .email(
        intl.formatMessage({
          id: 'validation.email.invalid',
          defaultMessage: 'Please enter a valid email address'
        })
      ),
    password: z.string().min(
      1,
      intl.formatMessage({
        id: 'validation.password.required',
        defaultMessage: 'Password is required'
      })
    ),
    rememberMe: z.boolean().default(true)
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await auth.login({ email: data.email, password: data.password });
      await router.invalidate();
      await sleep(1);
      toast.success(
        intl.formatMessage({
          id: 'auth.login.success',
          defaultMessage: 'Successfully logged in!'
        })
      );
      await navigate({ to: search.redirect || fallback });
    } catch (error) {
      console.error('Error logging in: ', error);
      toast.error(
        intl.formatMessage({
          id: 'auth.login.error',
          defaultMessage: 'Failed to login. Please try again.'
        })
      );
    }
  };

  const isLoggingIn = isLoading || form.formState.isSubmitting;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="bg-primary mb-2 inline-block rounded-lg p-2 text-white">
          <MessageCircleIcon className="size-10" />
        </div>
        <h1 className="text-2xl font-bold">
          <FormattedMessage id="auth.login.title" defaultMessage="Login" />
        </h1>
        <p className="text-muted-foreground">
          {search.redirect ? (
            <FormattedMessage
              id="auth.login.redirectMessage"
              defaultMessage="Please login to access this page"
            />
          ) : (
            <FormattedMessage
              id="auth.login.defaultMessage"
              defaultMessage="Enter your credentials to access the dashboard"
            />
          )}
        </p>
      </div>
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage
                      id="auth.login.email"
                      defaultMessage="Email"
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={intl.formatMessage({
                        id: 'placeholders.email',
                        defaultMessage: 'Enter your email'
                      })}
                      disabled={isLoggingIn}
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
                    <FormattedMessage
                      id="auth.login.password"
                      defaultMessage="Password"
                    />
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder={intl.formatMessage({
                        id: 'placeholders.password',
                        defaultMessage: 'Enter your password'
                      })}
                      disabled={isLoggingIn}
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
                        disabled={isLoggingIn}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      <FormattedMessage
                        id="auth.login.rememberMe"
                        defaultMessage="Remember me"
                      />
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
                  'text-foreground text-sm'
                )}
                to="/auth/forgot-password"
              >
                <FormattedMessage
                  id="auth.login.forgotPassword"
                  defaultMessage="Forgot password?"
                />
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <FormattedMessage
                  id="auth.login.loggingIn"
                  defaultMessage="Logging in..."
                />
              ) : (
                <FormattedMessage
                  id="auth.login.submit"
                  defaultMessage="Login"
                />
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
