import { buildResourceUrl } from '@/config/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2 } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
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

  const response = await fetch(
    buildResourceUrl('reservations', reservationId),
    {
      method: 'DELETE'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete reservation');
  }

  return response.json();
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
              <FormattedMessage
                id="reservations.deleted"
                defaultMessage="Reservation deleted"
              />
            </span>
          </div>
          <div>
            <FormattedMessage
              id="reservations.deletedMessage"
              defaultMessage="The reservation <span className='font-medium'>{reservationNr}</span> has been deleted"
              values={{
                reservationNr: (
                  <span className="font-medium">{reservationNr}</span>
                )
              }}
            />
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
              <FormattedMessage
                id="reservations.deleteError"
                defaultMessage="Error deleting reservation"
              />
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
            <FormattedMessage
              id="reservations.deleteConfirmTitle"
              defaultMessage="Are you sure?"
            />
          </AlertDialogTitle>
          <AlertDialogDescription className="py-4">
            <FormattedMessage
              id="reservations.deleteConfirmDesc"
              defaultMessage="The reservation <span className='font-medium'>{reservationNr}</span> will be deleted. This action cannot be undone."
              values={{
                reservationNr: (
                  <span className="font-medium">{reservationNr}</span>
                )
              }}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <FormattedMessage id="actions.cancel" defaultMessage="Cancel" />
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={deleteReservationMutation.isPending}
            onClick={() => deleteReservationMutation.mutate()}
          >
            {deleteReservationMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <FormattedMessage id="actions.delete" defaultMessage="Delete" />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
