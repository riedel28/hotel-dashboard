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

// How many descendants are listed by name before "and N more".
const listedDescendants = 5;

interface DeleteNodeDialogProps {
  target: { title: string; descendantTitles: string[] } | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteNodeDialog({
  target,
  onOpenChange,
  onConfirm
}: DeleteNodeDialogProps) {
  const title = target?.title ?? '';
  const descendants = target?.descendantTitles ?? [];
  const rest = descendants.length - listedDescendants;

  return (
    <AlertDialog open={target != null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>Delete “{title}”?</Trans>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {descendants.length > 0 ? (
              <Plural
                value={descendants.length}
                one="Its # nested item is deleted with it:"
                other="Its # nested items are deleted with it:"
              />
            ) : (
              <Trans>The item is deleted for good.</Trans>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {descendants.length > 0 && (
          <ul className="list-disc space-y-0.5 ps-5 text-sm">
            {descendants.slice(0, listedDescendants).map((name, index) => (
              <li key={index} className="truncate">
                {name}
              </li>
            ))}
            {rest > 0 && (
              <li className="list-none text-muted-foreground">
                <Trans>and {rest} more</Trans>
              </li>
            )}
          </ul>
        )}
        <p className="text-sm font-medium text-danger">
          <Trans>This cannot be undone.</Trans>
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Cancel</Trans>
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive-soft" onClick={onConfirm}>
            <Trans>Delete</Trans>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
