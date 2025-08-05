import { useState } from 'react';

import {
  Link,
  createFileRoute,
  redirect,
  useRouter,
  useRouterState
} from '@tanstack/react-router';
import { MessageCircleIcon } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';

import { cn } from '@/lib/utils';

import { useAuth } from '../../../auth';
import { sleep } from '../../../utils';

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

function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const navigate = Route.useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const intl = useIntl();

  const search = Route.useSearch();

  const onFormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setIsSubmitting(true);

    try {
      if (!email || !password) {
        toast.error('Please fill in all fields');
        return;
      }

      await auth.login({ email, password });
      await router.invalidate();
      await sleep(1);
      toast.success('Successfully logged in!');
      await navigate({ to: search.redirect || fallback });
    } catch (error) {
      console.error('Error logging in: ', error);
      toast.error('Failed to login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoggingIn = isLoading || isSubmitting;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="bg-primary mb-2 inline-block rounded-md p-2 text-white">
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
        <form onSubmit={onFormSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              <FormattedMessage id="auth.login.email" defaultMessage="Email" />
            </label>
            <Input
              id="email"
              type="email"
              placeholder={intl.formatMessage({
                id: 'placeholders.email',
                defaultMessage: 'Enter your email'
              })}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoggingIn}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              <FormattedMessage
                id="auth.login.password"
                defaultMessage="Password"
              />
            </label>
            <PasswordInput
              placeholder={intl.formatMessage({
                id: 'placeholders.password',
                defaultMessage: 'Enter your password'
              })}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoggingIn}
              required
            />
          </div>
          <div className="flex justify-between">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox />
              <FormattedMessage
                id="auth.login.rememberMe"
                defaultMessage="Remember me"
              />
            </label>
            <Link
              className={cn(
                buttonVariants({
                  mode: 'link'
                }),
                'underline-offset-4 hover:underline'
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
              <FormattedMessage id="auth.login.submit" defaultMessage="Login" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
