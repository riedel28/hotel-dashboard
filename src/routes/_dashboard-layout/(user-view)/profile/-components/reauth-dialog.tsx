import { Trans } from '@lingui/react/macro';
import { Loader2Icon } from 'lucide-react';
import * as React from 'react';

import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';

export interface Reauth {
  current_password?: string;
}

interface UseReauthedActionOptions<T> {
  action: (reauth: Reauth) => Promise<T>;
  onSuccess: (result: T) => void;
  onError?: (error: unknown) => void;
  /** The password prompt was dismissed, so the action never ran. */
  onCancel?: () => void;
}

/**
 * Runs an action that the server may refuse with REAUTH_REQUIRED, and on refusal
 * collects the password and replays the identical request with it.
 *
 * Keeping the retry here means callers never have to know whether the session
 * happened to be fresh — they just call `run()`.
 */
export function useReauthedAction<T>({
  action,
  onSuccess,
  onError,
  onCancel
}: UseReauthedActionOptions<T>) {
  const [promptOpen, setPromptOpen] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);

  /**
   * Callers put `run` in effect dependency arrays, so its identity has to be
   * stable across renders. The callbacks themselves are read through a ref:
   * capturing them in the closure would change the identity on every render,
   * and an effect depending on it would re-fire forever.
   */
  const latest = React.useRef({ action, onSuccess, onError, onCancel });
  latest.current = { action, onSuccess, onError, onCancel };

  const invoke = React.useCallback(async (reauth: Reauth) => {
    setIsRunning(true);
    setError(null);
    try {
      const result = await latest.current.action(reauth);
      setPromptOpen(false);
      setPassword('');
      latest.current.onSuccess(result);
      return true;
    } catch (caught) {
      if (caught instanceof ApiError) {
        if (caught.code === 'REAUTH_REQUIRED') {
          setPromptOpen(true);
          return false;
        }
        if (caught.code === 'REAUTH_FAILED') {
          setError(caught.message);
          return false;
        }
      }
      setPromptOpen(false);
      latest.current.onError?.(caught);
      return false;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const run = React.useCallback(() => void invoke({}), [invoke]);

  // Without telling the caller, a dialog waiting on the action (the 2FA setup
  // with its QR spinner) would stay open, waiting for a result that never comes.
  const cancel = () => {
    setPromptOpen(false);
    setPassword('');
    setError(null);
    latest.current.onCancel?.();
  };

  const dialog = (
    <Dialog
      open={promptOpen}
      onOpenChange={(open) => {
        if (!open) cancel();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void invoke({ current_password: password });
          }}
        >
          <DialogHeader>
            <DialogTitle>
              <Trans>Confirm your password</Trans>
            </DialogTitle>
            <DialogDescription>
              <Trans>
                You've been signed in for a while. Confirm your password to
                change security settings.
              </Trans>
            </DialogDescription>
          </DialogHeader>

          <Field className="my-4 gap-2" data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="reauth-password">
              <Trans>Password</Trans>
            </FieldLabel>
            <PasswordInput
              id="reauth-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
              // The dialog exists solely to take this one input.
              autoFocus
            />
            {error && <FieldError errors={[{ message: error }]} />}
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={cancel}>
              <Trans>Cancel</Trans>
            </Button>
            <Button
              type="submit"
              disabled={password.length === 0 || isRunning}
              aria-busy={isRunning}
            >
              {isRunning && (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              )}
              <Trans>Continue</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return { run, dialog, isRunning };
}
