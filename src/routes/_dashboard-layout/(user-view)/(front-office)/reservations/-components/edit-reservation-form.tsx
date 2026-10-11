import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import type { ReservationFormData } from 'shared/types/reservations';
import { toast } from 'sonner';

import { updateReservationById } from '@/api/reservations';
import { FormSection } from '@/components/form-section';
import { type NavSection, SectionNav } from '@/components/section-nav';
import { StickyCardFooter } from '@/components/sticky-card-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';

import { revealFirstError, sectionsWithErrors } from '../-lib/section-errors';
import { GuestsSection } from './guests-section';
import { PurposeField, RoomField, StayFields } from './reservation-fields';

interface EditReservationFormProps {
  reservationId: string;
  reservationData: ReservationFormData;
}

export function EditReservationForm({
  reservationId,
  reservationData
}: EditReservationFormProps) {
  const queryClient = useQueryClient();
  const { t } = useLingui();
  const form = useForm<ReservationFormData>({
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

  const isDirty = form.formState.isDirty;
  const isSaving = updateReservationMutation.isPending;

  return (
    <>
      <div className="flex flex-row gap-8">
        <SectionNav
          sections={RESERVATION_FORM_SECTIONS}
          errorIds={sectionsWithErrors(form.formState.errors, SECTION_FIELDS)}
          className="order-2 hidden xl:block"
        />

        <Card className="relative max-w-4xl min-w-0 flex-1 overflow-visible">
          <CardContent>
            <form
              id="reservation-form"
              onSubmit={form.handleSubmit(
                (data) => updateReservationMutation.mutate(data),
                (errors) => revealFirstError(errors, SECTION_FIELDS)
              )}
              aria-busy={isSaving}
              className="flex flex-col gap-6 md:gap-8"
              noValidate
            >
              <fieldset disabled={isSaving} className="contents">
                <FormSection
                  id="reservation"
                  title={<Trans>Reservation</Trans>}
                  description={
                    <Trans>
                      The booking number, the room and the purpose of the stay.
                    </Trans>
                  }
                >
                  <FieldGroup className="gap-4">
                    <Controller
                      control={form.control}
                      name="booking_nr"
                      render={({ field }) => (
                        <Field className="gap-2">
                          <FieldLabel htmlFor={field.name}>
                            <Trans>Reservation No.</Trans>
                          </FieldLabel>
                          <InputGroup>
                            {/* Not editable, so it takes no focus; the copy button does */}
                            <InputGroupInput
                              id={field.name}
                              value={field.value}
                              readOnly
                              tabIndex={-1}
                              className="pointer-events-none"
                            />
                            <InputGroupAddon align="inline-end">
                              <CopyButton
                                text={field.value}
                                size="icon-xs"
                                copyLabel={t`Copy reservation number`}
                                copiedLabel={t`Copied to clipboard`}
                              />
                            </InputGroupAddon>
                          </InputGroup>
                        </Field>
                      )}
                    />

                    <RoomField form={form} />
                    <PurposeField form={form} />
                  </FieldGroup>
                </FormSection>

                <Separator />

                <FormSection
                  id="stay"
                  title={<Trans>Stay</Trans>}
                  description={
                    <Trans>When the guests arrive and when they leave.</Trans>
                  }
                >
                  <FieldGroup className="gap-4">
                    <StayFields form={form} />
                  </FieldGroup>
                </FormSection>

                <Separator />

                <FormSection
                  id="guests"
                  title={<Trans>Guests</Trans>}
                  description={
                    <Trans>
                      How many people are staying, by age group, and who they
                      are. The primary guest is the one the reservation is
                      booked under.
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
                {isSaving ? (
                  <Trans>Saving changes…</Trans>
                ) : isDirty ? null : (
                  <Trans>No unsaved changes</Trans>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={!isDirty || isSaving}
                >
                  <Trans>Cancel</Trans>
                </Button>
                <Button
                  type="submit"
                  form="reservation-form"
                  disabled={isSaving}
                >
                  {isSaving && (
                    <Loader2Icon className="animate-spin" aria-hidden="true" />
                  )}
                  <Trans>Save Changes</Trans>
                </Button>
              </div>
            </div>
          </StickyCardFooter>
        </Card>
      </div>
    </>
  );
}

/**
 * Single source of truth for the page's sections: the form renders one
 * `<section>` per entry and the table of contents links to them by id.
 */
const RESERVATION_FORM_SECTIONS: NavSection[] = [
  { id: 'reservation', label: <Trans>Reservation</Trans> },
  { id: 'stay', label: <Trans>Stay</Trans> },
  { id: 'guests', label: <Trans>Guests</Trans> }
];

/** Which section each field sits in, for the error dots in the navigation. */
const SECTION_FIELDS = {
  reservation: ['room_name', 'purpose'],
  stay: ['booking_from', 'booking_to'],
  guests: ['adults', 'youth', 'children', 'infants', 'guests']
};
