import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, Link } from '@tanstack/react-router';
import { CheckIcon, Loader2Icon, XCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { verifyEmail } from '@/api/auth';
import { useDocumentTitle } from '@/hooks/use-document-title';

export const Route = createFileRoute('/_auth-layout/auth/verify-email')({
  validateSearch: z.object({
    token: z.string().optional()
  }),
  component: VerifyEmailPage
});

function VerifyEmailPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Verify Email`);
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setStatus('pending');

    verifyEmail(token)
      .then(() => {
        if (!cancelled) setStatus('success');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
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

  if (status === 'idle' || status === 'pending') {
    return (
      <div
        className="w-full max-w-lg space-y-8"
        role="status"
        aria-live="polite"
      >
        <div className="space-y-4 text-center">
          <Loader2Icon
            className="mx-auto size-10 animate-spin text-primary"
            aria-hidden="true"
          />
          <h1 className="text-2xl font-bold">
            <Trans>Verifying your email...</Trans>
          </h1>
        </div>
      </div>
    );
  }

  if (status === 'error') {
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
        <p className="text-muted-foreground text-balance">
          <Trans>
            Your email has been verified successfully. You can now log in.
          </Trans>
        </p>
      </div>
      <div className="text-center">
        <Link
          to="/auth/login"
          className="text-primary hover:underline underline-offset-4 font-medium text-sm"
        >
          <Trans>Go to login</Trans>
        </Link>
      </div>
    </div>
  );
}
