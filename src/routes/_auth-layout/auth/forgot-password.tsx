import { Link, createFileRoute } from '@tanstack/react-router';

import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_auth-layout/auth/forgot-password')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      Hello "/_auth-layout/auth/forgot-password"!
      <Link
        className={cn(
          buttonVariants({
            variant: 'link',
            className: 'p-0'
          })
        )}
        to="/auth/login"
      >
        Back to login
      </Link>
    </div>
  );
}
