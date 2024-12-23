import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  reservationId: number
}

async function deleteReservation(reservationId: number) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const response = await fetch(`http://localhost:5000/reservations/${reservationId}`, {
    method: 'DELETE',
  });

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
            <span className="font-bold">Reservation deleted</span>
          </div>
          <div>
            The reservation <span className="font-medium">{reservationNr}</span> has been
            deleted
          </div>
        </div>
      );
    },
    onError: (error) => {
      toast.error(
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-bold">Error deleting reservation</span>
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
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="py-4">
            The reservation <span className="font-medium">{reservationNr}</span>{' '}
            will be deleted. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={deleteReservationMutation.isPending}
            onClick={() => deleteReservationMutation.mutate()}
          >
            {deleteReservationMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
