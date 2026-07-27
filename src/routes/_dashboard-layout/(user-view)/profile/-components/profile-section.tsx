import { Trans, useLingui } from '@lingui/react/macro';
import { useBlocker } from '@tanstack/react-router';
import { Loader2Icon } from 'lucide-react';
import * as React from 'react';

import { sectionHeadingId } from '@/components/section-nav';
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
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useOnlineStatus } from '@/hooks';
import { cn } from '@/lib/utils';

/** How long the card's border stays lit after a successful save. */
const SUCCESS_FLASH_MS = 900;

interface ProfileSectionProps {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Badge or status rendered opposite the title. */
  action?: React.ReactNode;
  /** Applied to the card — this is where `useSuccessFlash().flashClass` goes. */
  className?: string;
  children: React.ReactNode;
}

/**
 * The shell every profile card shares: an anchor target for the section nav and
 * a heading wired up for `aria-labelledby`.
 *
 * Cards that own a form wrap their body in `ProfileSectionForm`, which adds the
 * save footer. Cards that don't (two-factor, roles) just render children.
 */
export function ProfileSection({
  id,
  title,
  description,
  action,
  className,
  children
}: ProfileSectionProps) {
  return (
    <section
      id={id}
      // Focusable so jumping from the nav moves the caret here, not just the
      // scroll position — otherwise keyboard users land nowhere.
      tabIndex={-1}
      aria-labelledby={sectionHeadingId(id)}
      // Below `lg` the chip bar is sticky over the top of the scroll area, so a
      // jump has to clear its 60px or it lands on the card's own title.
      className="scroll-mt-16 focus-visible:outline-none lg:scroll-mt-4"
    >
      <Card className={cn('@container/section', className)}>
        <CardHeader>
          <CardTitle id={sectionHeadingId(id)}>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>
        {children}
      </Card>
    </section>
  );
}

interface ProfileSectionFormProps {
  /** Marks the section dirty, enabling Save and arming the navigation guard. */
  isDirty: boolean;
  isSubmitting: boolean;
  submitLabel: React.ReactNode;
  onSubmit: () => void;
  onReset: () => void;
  /** Hides Cancel and keeps Save always enabled — used by the password form,
   *  which has nothing to revert to and no meaningful dirty baseline. */
  alwaysEnabled?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export function ProfileSectionForm({
  isDirty,
  isSubmitting,
  submitLabel,
  onSubmit,
  onReset,
  alwaysEnabled = false,
  disabled = false,
  children
}: ProfileSectionFormProps) {
  const { t } = useLingui();
  const isOnline = useOnlineStatus();
  const formRef = React.useRef<HTMLFormElement>(null);

  const canSubmit =
    !isSubmitting && !disabled && isOnline && (alwaysEnabled || isDirty);

  // Cmd/Ctrl+S saves the section the caret is inside, matching the muscle
  // memory the rest of the app's forms don't yet have but users bring anyway.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key !== 's') return;
      if (!formRef.current?.contains(document.activeElement)) return;
      event.preventDefault();
      if (canSubmit) onSubmit();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [canSubmit, onSubmit]);

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      // `contents` so the form doesn't introduce a box between the card and
      // its content/footer, which would break the card's own spacing rules.
      className="contents"
    >
      <CardContent className="space-y-6">{children}</CardContent>
      <CardFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {isDirty && !alwaysEnabled && (
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            <Trans>Cancel</Trans>
          </Button>
        )}
        <Button
          type="submit"
          disabled={!canSubmit}
          aria-busy={isSubmitting}
          // Fixed minimum so swapping the label for a spinner doesn't resize it.
          className="w-full min-w-30 sm:w-auto"
          title={isOnline ? undefined : t`You're offline`}
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
              <Trans>Saving…</Trans>
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </CardFooter>
    </form>
  );
}

/**
 * Blocks navigation while any section holds unsaved edits. One guard for the
 * whole page rather than one per card, so leaving with two dirty sections
 * prompts once.
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

/**
 * Bottom bar shown on small screens while a section is dirty, so Save is always
 * within thumb reach instead of somewhere below the fold.
 */
export function MobileSaveBar({
  visible,
  isSubmitting,
  onSave,
  onCancel
}: {
  visible: boolean;
  isSubmitting: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isOnline = useOnlineStatus();

  if (!visible) return null;

  return (
    <div
      className="bg-background/95 fixed inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t px-4 py-3 backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <span className="text-muted-foreground flex-1 text-sm">
        <Trans>Unsaved changes</Trans>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        <Trans>Cancel</Trans>
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={onSave}
        disabled={isSubmitting || !isOnline}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Trans>Save</Trans>
        )}
      </Button>
    </div>
  );
}

/**
 * Drives the brief border highlight after a save. Returns a class to spread on
 * the card and a trigger to call from the mutation's onSuccess.
 */
export function useSuccessFlash() {
  const [flashing, setFlashing] = React.useState(false);

  const flash = React.useCallback(() => {
    setFlashing(true);
    window.setTimeout(() => setFlashing(false), SUCCESS_FLASH_MS);
  }, []);

  return {
    flash,
    flashing,
    flashClass: cn(
      'transition-shadow duration-300',
      flashing && 'ring-2 ring-emerald-500/70'
    )
  };
}
