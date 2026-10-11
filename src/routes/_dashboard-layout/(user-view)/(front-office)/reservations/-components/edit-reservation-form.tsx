import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  type ReservationFormData,
  reservationFormSchema
} from 'shared/types/reservations';
import { toast } from 'sonner';

import { updateReservationById } from '@/api/reservations';
import {
  type FormSectionDef,
  SectionedForm
} from '@/components/sectioned-form';
import { CopyButton } from '@/components/ui/copy-button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group';

import { GUESTS_SECTION } from './guests-section';
import { PurposeField, RoomField, StayFields } from './reservation-fields';

interface EditReservationFormProps {
  reservationId: string;
  /** Shown, not edited: the server assigned it. */
  bookingNr: string;
  reservationData: ReservationFormData;
}

export function EditReservationForm({
  reservationId,
  bookingNr,
  reservationData
}: EditReservationFormProps) {
  const queryClient = useQueryClient();
  const { t } = useLingui();
  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationFormSchema),
    values: reservationData
  });

  const updateReservationMutation = useMutation({
    mutationFn: (data: ReservationFormData) =>
      updateReservationById(reservationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success(t`Reservation updated successfully`);
    },
    onError: (error) => {
      console.error('Failed to update reservation:', error);
      toast.error(t`Failed to update reservation. Please try again.`);
    }
  });

  const sections = useMemo(() => editSections(bookingNr), [bookingNr]);

  return (
    <SectionedForm
      form={form}
      sections={sections}
      onSubmit={(data) => updateReservationMutation.mutate(data)}
      isSaving={updateReservationMutation.isPending}
      submitLabel={<Trans>Update Reservation</Trans>}
    />
  );
}

function ReservationNumber({ bookingNr }: { bookingNr: string }) {
  const { t } = useLingui();

  return (
    <Field className="gap-2">
      <FieldLabel htmlFor="booking_nr">
        <Trans>Reservation No.</Trans>
      </FieldLabel>
      <InputGroup>
        {/* Not editable, so it takes no focus; the copy button does */}
        <InputGroupInput
          id="booking_nr"
          value={bookingNr}
          readOnly
          tabIndex={-1}
          className="pointer-events-none"
        />
        <InputGroupAddon align="inline-end">
          <CopyButton
            text={bookingNr}
            size="icon-xs"
            copyLabel={t`Copy reservation number`}
            copiedLabel={t`Copied to clipboard`}
          />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}

const editSections = (
  bookingNr: string
): FormSectionDef<ReservationFormData>[] => [
  {
    id: 'reservation',
    label: <Trans>Reservation</Trans>,
    description: (
      <Trans>The booking number, the room and the purpose of the stay.</Trans>
    ),
    fields: ['room_name', 'purpose'],
    render: (form) => (
      <FieldGroup className="gap-4">
        <ReservationNumber bookingNr={bookingNr} />
        <RoomField form={form} />
        <PurposeField form={form} />
      </FieldGroup>
    )
  },
  {
    id: 'stay',
    label: <Trans>Stay</Trans>,
    description: <Trans>When the guests arrive and when they leave.</Trans>,
    fields: ['booking_from', 'booking_to'],
    render: (form) => (
      <FieldGroup className="gap-4">
        <StayFields form={form} />
      </FieldGroup>
    )
  },
  GUESTS_SECTION
];
