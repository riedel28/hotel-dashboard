import { Plural, Trans } from '@lingui/react/macro';

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
import { Button } from '@/components/ui/button';

import type { TypeChange } from '../-lib/cms-content';
import { useLastNonNull } from '../-lib/use-last-non-null';
import type { useNodeForm } from './use-node-form';

// Page → link: refused while it has nested items, confirmed when text or
// images would go.
export function TypeChangeDialog({
  change,
  onClose,
  onConfirm
}: {
  change: TypeChange | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const shown = useLastNonNull(change);
  const blocked = shown?.kind === 'blocked';
  return (
    <AlertDialog
      open={change != null && change.kind !== 'free'}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked ? (
              <Trans>This page has nested items</Trans>
            ) : (
              <Trans>Make this a link?</Trans>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {shown?.kind === 'blocked' && (
              <Plural
                value={shown.childCount}
                one="A link can’t contain other items. Move or delete its # nested item first."
                other="A link can’t contain other items. Move or delete its # nested items first."
              />
            )}
            {shown?.kind === 'confirm' &&
              (shown.hasText ? (
                <Plural
                  value={shown.imageCount}
                  _0="The text is removed when you save."
                  one="The text and # image are removed when you save."
                  other="The text and # images are removed when you save."
                />
              ) : (
                <Plural
                  value={shown.imageCount}
                  one="# image is removed when you save."
                  other="# images are removed when you save."
                />
              ))}{' '}
            {!blocked && (
              <Trans>
                Until then you can switch back without losing anything.
              </Trans>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {blocked ? (
            <AlertDialogCancel>
              <Trans>Cancel</Trans>
            </AlertDialogCancel>
          ) : (
            <>
              <AlertDialogCancel>
                <Trans>Cancel</Trans>
              </AlertDialogCancel>
              <AlertDialogAction onClick={onConfirm}>
                <Trans>Make it a link</Trans>
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Leaving the form with unsaved changes: stay, discard or save first.
export function UnsavedChangesDialog({
  blocker,
  title,
  isSaving,
  onSave
}: {
  blocker: ReturnType<typeof useNodeForm>['blocker'];
  title: string;
  isSaving: boolean;
  onSave: () => Promise<boolean>;
}) {
  return (
    <AlertDialog
      open={blocker.status === 'blocked'}
      onOpenChange={(open) => !open && blocker.reset?.()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>Save changes?</Trans>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Trans>“{title}” has unsaved changes.</Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => blocker.reset?.()}>
            <Trans>Stay</Trans>
          </AlertDialogCancel>
          <Button variant="outline" onClick={() => blocker.proceed?.()}>
            <Trans>Don’t save</Trans>
          </Button>
          <Button
            disabled={isSaving}
            onClick={async () => {
              if (await onSave()) blocker.proceed?.();
              else blocker.reset?.();
            }}
          >
            <Trans>Save</Trans>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
