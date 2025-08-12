 
import { client } from '@/api/client';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const queryClient = useQueryClient();

  const deleteReservationMutation = useMutation({
    mutationFn: () => deleteReservation(reservationId),
    onSuccess: async () => {
      // First close the modal
      onOpenChange(false);

      // Then update the table and show success message after the update
      await queryClient.invalidateQueries({ queryKey: ['reservations'] });

      toast.success(
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-bold">
              <Trans>Reservation deleted</Trans>
            </span>
          </div>
          <div>
            <Trans>
              The reservation{' '}
              <span className="font-medium">{reservationNr}</span>
              has been deleted
            </Trans>
          </div>
        </div>
      );
    },
    onError: (error) => {
      toast.error(
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-bold">
              <Trans>Error deleting reservation</Trans>
            </span>
          </div>
          <div>{error.message}</div>
        </div>
      );
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
              The reservation{' '}
              <span className="font-medium">{reservationNr}</span>
              will be deleted. This action cannot be undone.
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Cancel</Trans>
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={deleteReservationMutation.isPending}
            onClick={() => deleteReservationMutation.mutate()}
          >
            {deleteReservationMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Trans>Delete</Trans>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
