import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { InfoIcon, Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { ReservationFormData } from 'shared/types/reservations';
import { toast } from 'sonner';

import { createReservation } from '@/api/reservations';
import { FormSection } from '@/components/form-section';
import { type NavSection, SectionNav } from '@/components/section-nav';
import { StickyCardFooter } from '@/components/sticky-card-footer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';

import { revealFirstError, sectionsWithErrors } from '../-lib/section-errors';
import { GuestsSection } from './guests-section';
import { PurposeField, RoomField, StayFields } from './reservation-fields';

export function AddReservationForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useLingui();
  const form = useForm<ReservationFormData>({
    defaultValues: {
      // Assigned by the server; only here because the form shares its fields
      // with the edit form
      booking_nr: '',
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
    mutationFn: ({ booking_nr: _booking_nr, ...data }: ReservationFormData) =>
      createReservation(data),
    onSuccess: (reservation) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success(t`Reservation created successfully`);
      // On to the reservation itself, where its new number is shown; from the
      // top, as the scroll container outlives the navigation
      document.getElementById('main-content')?.scrollTo({ top: 0 });
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
    <div className="flex flex-row gap-8">
      <SectionNav
        sections={ADD_RESERVATION_SECTIONS}
        errorIds={sectionsWithErrors(form.formState.errors, SECTION_FIELDS)}
        className="order-2 hidden xl:block"
      />

      <Card className="relative max-w-4xl min-w-0 flex-1 overflow-visible">
        <CardContent>
          <form
            id="reservation-form"
            onSubmit={form.handleSubmit(
              (data) => createReservationMutation.mutate(data),
              (errors) => revealFirstError(errors, SECTION_FIELDS)
            )}
            aria-busy={isSaving}
            className="flex flex-col gap-6 md:gap-8"
            noValidate
          >
            <fieldset disabled={isSaving} className="contents">
              <FormSection
                id="stay"
                title={<Trans>Stay</Trans>}
                description={
                  <Trans>
                    When the guests arrive, when they leave and the room they
                    stay in.
                  </Trans>
                }
              >
                <FieldGroup className="gap-4">
                  <StayFields form={form} />
                  <RoomField form={form} />
                </FieldGroup>
              </FormSection>

              <Separator />

              <FormSection
                id="reservation"
                title={<Trans>Reservation</Trans>}
                description={
                  <Trans>The booking number and the purpose of the stay.</Trans>
                }
              >
                <FieldGroup className="gap-4">
                  {/* Not a field: there is nothing to enter until the server assigns it */}
                  <Alert variant="info" role="note">
                    <InfoIcon aria-hidden="true" />
                    <AlertDescription>
                      <Trans>
                        The reservation number is assigned automatically on
                        save.
                      </Trans>
                    </AlertDescription>
                  </Alert>
                  <PurposeField form={form} />
                </FieldGroup>
              </FormSection>

              <Separator />

              <FormSection
                id="guests"
                title={<Trans>Guests</Trans>}
                description={
                  <Trans>
                    How many people are staying, by age group, and who they are.
                    The primary guest is the one the reservation is booked
                    under.
                  </Trans>
                }
              >
                <GuestsSection form={form} />
              </FormSection>
            </fieldset>
          </form>
        </CardContent>

        <StickyCardFooter>
          <div className="flex w-full flex-wrap items-center justify-end gap-3">
            <div
              className="mr-auto min-w-0 text-xs text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {isSaving && <Trans>Creating reservation…</Trans>}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void navigate({ to: '/reservations' })}
                disabled={isSaving}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button type="submit" form="reservation-form" disabled={isSaving}>
                {isSaving && (
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                )}
                <Trans>Create reservation</Trans>
              </Button>
            </div>
          </div>
        </StickyCardFooter>
      </Card>
    </div>
  );
}

const ADD_RESERVATION_SECTIONS: NavSection[] = [
  { id: 'stay', label: <Trans>Stay</Trans> },
  { id: 'reservation', label: <Trans>Reservation</Trans> },
  { id: 'guests', label: <Trans>Guests</Trans> }
];

/** Which section each field sits in, for the error dots in the navigation. */
const SECTION_FIELDS = {
  stay: ['booking_from', 'booking_to', 'room_name'],
  reservation: ['purpose'],
  guests: ['adults', 'youth', 'children', 'infants', 'guests']
};
