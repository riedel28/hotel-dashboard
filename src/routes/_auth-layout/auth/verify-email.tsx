import { Trans } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { CheckIcon, Loader2Icon, XCircleIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { z } from 'zod';

import { verifyEmail } from '@/api/auth';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_auth-layout/auth/verify-email')({
  validateSearch: z.object({
    token: z.string().optional()
  }),
  component: VerifyEmailPage
});

function VerifyEmailPage() {
  const { token } = Route.useSearch();

  const verifyMutation = useMutation({
    mutationFn: () => verifyEmail(token || '')
  });

  const didVerify = useRef(false);
  useEffect(() => {
    if (token && !didVerify.current) {
      didVerify.current = true;
      verifyMutation.mutate();
    }
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-4 text-center">
          <div className="inline-block rounded-full bg-red-200 p-2 text-red-800">
            <XCircleIcon className="size-7" />
          </div>
          <h1 className="text-2xl font-bold">
            <Trans>Invalid link</Trans>
          </h1>
          <p className="text-muted-foreground">
            <Trans>This verification link is invalid.</Trans>
          </p>
        </div>
        <div className="text-center">
          <Link
            to="/auth/login"
            className="text-primary hover:underline underline-offset-4 font-medium text-sm"
          >
            <Trans>Back to login</Trans>
          </Link>
        </div>
      </div>
    );
  }

  if (verifyMutation.isPending) {
    return (
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-4 text-center">
          <Loader2Icon className="mx-auto size-10 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">
            <Trans>Verifying your email...</Trans>
          </h1>
        </div>
      </div>
    );
  }

  if (verifyMutation.isError) {
    return (
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-4 text-center">
          <div className="inline-block rounded-full bg-red-200 p-2 text-red-800">
            <XCircleIcon className="size-7" />
          </div>
          <h1 className="text-2xl font-bold">
            <Trans>Verification failed</Trans>
          </h1>
          <p className="text-muted-foreground">
            <Trans>
              This verification link is invalid or has expired. Please request a
              new one.
            </Trans>
          </p>
        </div>
        <div className="text-center">
          <Link
            to="/auth/login"
            className="text-primary hover:underline underline-offset-4 font-medium text-sm"
          >
            <Trans>Back to login</Trans>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="space-y-4 text-center">
        <div className="inline-block rounded-full bg-green-200 p-2 text-green-800">
          <CheckIcon className="size-7" />
        </div>
        <h1 className="text-2xl font-bold">
          <Trans>Email verified!</Trans>
        </h1>
        <p className="text-muted-foreground">
          <Trans>
            Your email has been verified successfully. You can now log in.
          </Trans>
        </p>
      </div>
      <div className="text-center">
        <Button
          render={
            <Link to="/auth/login">
              <Trans>Go to login</Trans>
            </Link>
          }
        />
      </div>
    </div>
  );
}
