import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { deleteGuestAbcEntry } from '@/api/guest-abc';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeleteEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: number;
  entryTitle: string;
}

export function DeleteEntryDialog({
  open,
  onOpenChange,
  entryId,
  entryTitle
}: DeleteEntryDialogProps) {
  const queryClient = useQueryClient();

  const deleteEntryMutation = useMutation({
    mutationFn: () => deleteGuestAbcEntry(entryId),
    onSuccess: async () => {
      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: ['guest-abc'] });
      toast.success(
        <p className="font-normal">
          <Trans>
            Entry <span className="font-semibold">{entryTitle}</span> was
            deleted
          </Trans>
        </p>
      );
    },
    onError: () => {
      toast.error(t`Failed to delete entry. Please try again.`);
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>Delete entry?</Trans>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Trans>
              This will permanently delete{' '}
              <span className="font-semibold text-foreground">
                {entryTitle}
              </span>
              . This action cannot be undone.
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Cancel</Trans>
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => deleteEntryMutation.mutate()}
            disabled={deleteEntryMutation.isPending}
          >
            {deleteEntryMutation.isPending && (
              <Loader2Icon className="animate-spin" />
            )}
            <Trans>Delete</Trans>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
