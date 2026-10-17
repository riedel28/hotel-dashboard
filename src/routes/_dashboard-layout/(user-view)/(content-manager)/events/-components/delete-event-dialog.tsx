import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { deleteEvent, type HotelEvent, onEventDeleted } from '@/api/events';
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

interface DeleteEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Pick<HotelEvent, 'id' | 'title'>;
  /**
   * After the delete, e.g. to leave the deleted event's page; the event's
   * cache entry goes once the returned promise settles.
   */
  onDeleted?: () => void | Promise<void>;
}

export function DeleteEventDialog({
  open,
  onOpenChange,
  event,
  onDeleted
}: DeleteEventDialogProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const title = event.title;

  const remove = useMutation({
    mutationFn: () => deleteEvent(event.id),
    onSuccess: async () => {
      onOpenChange(false);
      // Off the event's own page first: it would refetch the deleted event
      await onDeleted?.();
      await onEventDeleted(queryClient, event.id);
      toast.success(t`The event “${title}” has been deleted`);
    },
    onError: () => {
      toast.error(t`Error deleting event`);
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>Delete event “{title}”?</Trans>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Trans>This action cannot be undone.</Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Cancel</Trans>
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => remove.mutate()}
            disabled={remove.isPending}
          >
            {remove.isPending && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Trans>Delete</Trans>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
