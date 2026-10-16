import { Trans } from '@lingui/react/macro';
import { useBlocker } from '@tanstack/react-router';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

/**
 * Blocks navigation while a page holds unsaved edits, and asks before leaving.
 * One guard per page: a page with several dirty forms prompts once.
 */
export function UnsavedChangesGuard({ when }: { when: boolean }) {
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => when,
    // Also catches a tab close or a hard reload, not just in-app navigation.
    enableBeforeUnload: () => when,
    withResolver: true
  });

  return (
    <AlertDialog open={status === 'blocked'} onOpenChange={() => reset?.()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>Discard changes?</Trans>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Trans>
              You have unsaved changes on this page. If you leave now they'll be
              lost.
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => reset?.()}>
            <Trans>Keep editing</Trans>
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => proceed?.()}>
            <Trans>Discard changes</Trans>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
