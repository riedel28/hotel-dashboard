import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { client } from '@/api/client';

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

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationNr: string;
  reservationId: number;
}

async function deleteReservation(reservationId: number) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return client.delete(`/reservations/${reservationId}`);
}

export function DeleteDialog({
  open,
  onOpenChange,
  reservationNr,
  reservationId
}: DeleteDialogProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const deleteReservationMutation = useMutation({
    mutationFn: () => deleteReservation(reservationId),
    onSuccess: async () => {
      // First close the modal
      onOpenChange(false);

      // Then update the table and show success message after the update
      await queryClient.invalidateQueries({ queryKey: ['reservations'] });

      toast.success(t`The reservation ${reservationNr} has been deleted`);
    },
    onError: () => {
      toast.error(t`Error deleting reservation`);
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>Are you sure?</Trans>
          </AlertDialogTitle>
          <AlertDialogDescription className="py-4">
            <Trans>
              The reservation&nbsp;
              <span className="font-medium text-foreground">
                {reservationNr}
              </span>
              &nbsp;will be deleted. This action cannot be undone.
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Cancel</Trans>
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => deleteReservationMutation.mutate()}
            disabled={deleteReservationMutation.isPending}
          >
            {deleteReservationMutation.isPending && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Trans>Delete</Trans>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
