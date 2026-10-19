import { Trans, useLingui } from '@lingui/react/macro';
import {
  ArrowUpRightIcon,
  CheckIcon,
  CopyIcon,
  Loader2Icon,
  TriangleAlertIcon
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardAction, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

interface CheckinHeaderProps {
  guestUrl: string | null;
  /** The form has edits that switching off would drop. */
  hasUnsavedChanges: boolean;
  /** Switches online check-in off; the page then shows its empty state. */
  onDeactivate: () => Promise<unknown>;
  isDeactivating: boolean;
}

/**
 * The header of the check-in settings: the guest link and switching off.
 * Outside the form: these apply at once, not with Save.
 */
export function CheckinHeader({
  guestUrl,
  hasUnsavedChanges,
  onDeactivate,
  isDeactivating
}: CheckinHeaderProps) {
  const [confirming, setConfirming] = React.useState(false);

  return (
    <CardHeader className="gap-4 border-b">
      <CardTitle className="flex items-center gap-2">
        <Trans>Online check-in</Trans>
        <Badge color="emerald" size="sm" className="rounded-md">
          <Trans>Active</Trans>
        </Badge>
      </CardTitle>
      {/* Rarely used and undoes the page: kept quiet */}
      <CardAction>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setConfirming(true)}
          disabled={isDeactivating}
        >
          <Trans>Deactivate</Trans>
        </Button>
      </CardAction>

      {guestUrl ? (
        <GuestLink url={guestUrl} />
      ) : (
        <Alert variant="caution" role="note" className="col-span-full">
          <TriangleAlertIcon aria-hidden="true" />
          <AlertDescription>
            <Trans>
              This property has no guest app domain yet, so the check-in links
              won’t work. An administrator sets it in the property’s settings.
            </Trans>
          </AlertDescription>
        </Alert>
      )}

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans>Deactivate online check-in?</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>Guests will no longer receive check-in links.</Trans>{' '}
              {hasUnsavedChanges && (
                <Trans>Your unsaved changes will be lost.</Trans>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>
              <Trans>Cancel</Trans>
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive-soft"
              disabled={isDeactivating}
              onClick={() =>
                // Success swaps the page for its empty state; a failure is
                // toasted by the page.
                void onDeactivate().catch(() => setConfirming(false))
              }
            >
              {isDeactivating && (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              )}
              <Trans>Deactivate</Trans>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CardHeader>
  );
}

// Text in a field's frame: something to copy and open, not to edit.
function GuestLink({ url }: { url: string }) {
  const { t } = useLingui();
  const { copy, copied } = useCopyToClipboard();
  const labelId = React.useId();

  return (
    // On the form sections' grid: the label in their headings' column, the
    // link as wide as their fields
    <div className="col-span-full grid grid-cols-1 gap-2 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center lg:gap-4">
      <span id={labelId} className="text-sm font-medium">
        <Trans>Link sent to guests</Trans>
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        // Read-only in both themes: grey in light, sunk below the card in
        // dark, where editable fields are lifted above it
        className="flex h-9 items-center gap-0.5 rounded-lg border border-input bg-muted/50 ps-3 pe-1 dark:border-border dark:bg-background/60"
      >
        <span className="min-w-0 flex-1 truncate text-sm" title={url}>
          {url}
        </span>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={copied ? t`Link copied` : t`Copy link`}
                onClick={async () => {
                  if (await copy(url)) toast.success(t`Link copied`);
                }}
              />
            }
          >
            {copied ? (
              <CheckIcon className="size-3.5 text-success" aria-hidden="true" />
            ) : (
              <CopyIcon aria-hidden="true" />
            )}
          </TooltipTrigger>
          <TooltipContent>
            <Trans>Copy link</Trans>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                nativeButton={false}
                aria-label={t`Preview (opens in new tab)`}
                render={
                  <a href={url} target="_blank" rel="noopener noreferrer" />
                }
              />
            }
          >
            <ArrowUpRightIcon aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>
            <Trans>Preview</Trans>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
