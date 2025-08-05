import { Link, createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_auth-layout/auth/forgot-password')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <FormattedMessage
        id="auth.forgotPassword.title"
        defaultMessage="Hello '/_auth-layout/auth/forgot-password'!"
      />
      <Link
        className={cn(
          buttonVariants({
            mode: 'link',
            underlined: 'solid'
          })
        )}
        to="/auth/login"
      >
        <FormattedMessage
          id="auth.backToLogin"
          defaultMessage="Back to login"
        />
      </Link>
    </div>
  );
}
