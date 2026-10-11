import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { reservationRoomLabel } from '@/lib/rooms';
import { formatDate } from '@/utils/date';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation;
}

async function deleteReservation(reservationId: number) {
  return client.delete(`/reservations/${reservationId}`);
}

/**
 * Enough to tell the reservation apart from its neighbours in the list. Its
 * own component so that only an open dialog works it out: there is a dialog
 * for every row.
 */
function ReservationSummary({ reservation }: { reservation: Reservation }) {
  const { t } = useLingui();
  const room = reservationRoomLabel(reservation);

  // Guest, room and stay, leaving out what the reservation does not have
  const details = [
    reservation.primary_guest_name,
    room && t`Room ${room}`,
    `${formatDate(reservation.booking_from, {})} – ${formatDate(reservation.booking_to, {})}`
  ].filter(Boolean);

  return <p className="text-sm wrap-anywhere">{details.join(' · ')}</p>;
}

export function DeleteDialog({
  open,
  onOpenChange,
  reservation
}: DeleteDialogProps) {
  const { id: reservationId, booking_nr: reservationNr } = reservation;
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
            <Trans>Delete reservation {reservationNr}?</Trans>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="flex flex-col gap-1">
          <ReservationSummary reservation={reservation} />
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
