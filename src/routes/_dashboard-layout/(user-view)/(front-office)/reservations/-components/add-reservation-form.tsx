import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { InfoIcon, Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  type ReservationFormData,
  reservationFormSchema
} from 'shared/types/reservations';
import { toast } from 'sonner';

import { createReservation } from '@/api/reservations';
import { scrollPageToTop } from '@/components/section-nav';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';

import { PurposeField, RoomField, StayFields } from './reservation-fields';
import {
  GUESTS_SECTION,
  ReservationFormLayout,
  type ReservationFormSection
} from './reservation-form-layout';

export function AddReservationForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useLingui();
  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      room_name: '',
      purpose: 'private',
      // The usual check-in and check-out times of a one-night stay from today
      booking_from: dayjs().hour(15).startOf('hour').toDate(),
      booking_to: dayjs().add(1, 'day').hour(11).startOf('hour').toDate(),
      adults: 1,
      youth: 0,
      children: 0,
      infants: 0,
      guests: []
    }
  });

  const createReservationMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: (reservation) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success(t`Reservation created successfully`);
      // On to the reservation itself, where its new number is shown
      scrollPageToTop();
      void navigate({
        to: '/reservations/$reservationId',
        params: { reservationId: String(reservation.id) }
      });
    },
    onError: (error) => {
      console.error('Failed to create reservation:', error);
      toast.error(t`Failed to create reservation`);
    }
  });

  // Stays disabled after a success, until the new reservation's page takes over
  const isSaving =
    createReservationMutation.isPending || createReservationMutation.isSuccess;

  return (
    <ReservationFormLayout
      form={form}
      sections={SECTIONS}
      onSubmit={(data) => createReservationMutation.mutate(data)}
      isSaving={isSaving}
      status={isSaving && <Trans>Creating reservation…</Trans>}
    >
      <Button
        type="button"
        variant="outline"
        onClick={() => void navigate({ to: '/reservations' })}
        disabled={isSaving}
      >
        <Trans>Cancel</Trans>
      </Button>
      <Button
        type="submit"
        form={ReservationFormLayout.formId}
        disabled={isSaving}
      >
        {isSaving && (
          <Loader2Icon className="animate-spin" aria-hidden="true" />
        )}
        <Trans>Create reservation</Trans>
      </Button>
    </ReservationFormLayout>
  );
}

const SECTIONS: ReservationFormSection[] = [
  {
    id: 'stay',
    label: <Trans>Stay</Trans>,
    description: (
      <Trans>
        When the guests arrive, when they leave and the room they stay in.
      </Trans>
    ),
    fields: ['booking_from', 'booking_to', 'room_name'],
    render: (form) => (
      <FieldGroup className="gap-4">
        <StayFields form={form} />
        <RoomField form={form} />
      </FieldGroup>
    )
  },
  {
    id: 'reservation',
    label: <Trans>Reservation</Trans>,
    description: <Trans>The booking number and the purpose of the stay.</Trans>,
    fields: ['purpose'],
    render: (form) => (
      <FieldGroup className="gap-4">
        {/* Not a field: there is nothing to enter until the server assigns it */}
        <Alert variant="info" role="note">
          <InfoIcon aria-hidden="true" />
          <AlertDescription>
            <Trans>
              The reservation number is assigned automatically on save.
            </Trans>
          </AlertDescription>
        </Alert>
        <PurposeField form={form} />
      </FieldGroup>
    )
  },
  GUESTS_SECTION
];
