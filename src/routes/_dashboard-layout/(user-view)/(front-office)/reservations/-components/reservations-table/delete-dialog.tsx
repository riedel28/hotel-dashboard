import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Loader2Icon } from 'lucide-react';
import type { Reservation } from 'shared/types/reservations';
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
  reservation: Reservation;
}

const DATE_FORMAT = 'DD.MM.YYYY';

async function deleteReservation(reservationId: number) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return client.delete(`/reservations/${reservationId}`);
}

export function DeleteDialog({
  open,
  onOpenChange,
  reservation
}: DeleteDialogProps) {
  const { id: reservationId, booking_nr: reservationNr } = reservation;
  const { t } = useLingui();

  // Guest, room and stay, leaving out what the reservation does not have
  const details = [
    reservation.primary_guest_name,
    reservation.room_number
      ? t`Room ${reservation.room_number}`
      : reservation.room_name,
    `${dayjs(reservation.booking_from).format(DATE_FORMAT)} – ${dayjs(reservation.booking_to).format(DATE_FORMAT)}`
  ].filter(Boolean);
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
            <Trans>Delete reservation {reservationNr}?</Trans>
          </AlertDialogTitle>
        </AlertDialogHeader>
        {/* Enough to tell the reservation apart from its neighbours in the list */}
        <div className="flex flex-col gap-1">
          <p className="text-sm wrap-anywhere">{details.join(' · ')}</p>
          <AlertDialogDescription>
            <Trans>This action cannot be undone.</Trans>
          </AlertDialogDescription>
        </div>
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
