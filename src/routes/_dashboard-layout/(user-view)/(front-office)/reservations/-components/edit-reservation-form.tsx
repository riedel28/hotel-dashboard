import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import type { ReservationFormData } from 'shared/types/reservations';
import { toast } from 'sonner';

import { deviceRoomOptionsQueryOptions } from '@/api/devices';
import { updateReservationById } from '@/api/reservations';
import { FormSection } from '@/components/form-section';
import { RoomPicker } from '@/components/room-picker';
import { type NavSection, SectionNav } from '@/components/section-nav';
import { StickyCardFooter } from '@/components/sticky-card-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { fieldTriggerClassName } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { roomLabel } from '@/lib/rooms';

import { countNights } from '../-lib/stay';
import { DateTimeField } from './date-time-field';
import { GuestsSection } from './guests-section';

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

  // The picker's own list, so the selected room is shown the way it is offered
  const { data: rooms = [] } = useQuery(deviceRoomOptionsQueryOptions());

  const [bookingFrom, bookingTo] = form.watch(['booking_from', 'booking_to']);
  const nights = countNights(bookingFrom, bookingTo);
  const isDirty = form.formState.isDirty;
  const isSaving = updateReservationMutation.isPending;

  return (
    <>
      <div className="flex flex-row gap-8">
        <SectionNav
          sections={RESERVATION_FORM_SECTIONS}
          className="order-2 hidden xl:block"
        />

        <Card className="relative max-w-4xl min-w-0 flex-1 overflow-visible">
          <CardContent>
            <form
              id="reservation-form"
              onSubmit={form.handleSubmit((data) =>
                updateReservationMutation.mutate(data)
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

                    <Controller
                      control={form.control}
                      name="room_name"
                      render={({ field, fieldState }) => {
                        const selectedRoom = rooms.find(
                          (room) => room.name === field.value
                        );

                        return (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="gap-2"
                          >
                            <FieldLabel htmlFor={field.name}>
                              <Trans>Room</Trans>
                            </FieldLabel>
                            <RoomPicker
                              id={field.name}
                              value={selectedRoom ?? null}
                              onValueChange={(room) =>
                                field.onChange(room.name)
                              }
                              className={fieldTriggerClassName}
                              contentClassName="w-(--anchor-width) min-w-(--anchor-width)"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                {selectedRoom ? (
                                  <>
                                    <span className="tabular-nums">
                                      {roomLabel(selectedRoom)}
                                    </span>
                                    {selectedRoom.room_number &&
                                      selectedRoom.name !==
                                        selectedRoom.room_number && (
                                        <span className="truncate text-muted-foreground">
                                          {selectedRoom.name}
                                        </span>
                                      )}
                                  </>
                                ) : field.value ? (
                                  // Kept as stored: it names no room of the property.
                                  <span className="truncate">
                                    {field.value}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    <Trans>Select a room</Trans>
                                  </span>
                                )}
                              </span>
                            </RoomPicker>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        );
                      }}
                    />

                    <Controller
                      control={form.control}
                      name="purpose"
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="gap-2"
                        >
                          <FieldLabel>
                            <Trans>Purpose of stay</Trans>
                          </FieldLabel>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid gap-2 sm:grid-cols-2"
                          >
                            <Label
                              htmlFor="purpose-private"
                              className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-input px-2.5 text-left text-sm font-normal transition-colors hover:bg-accent dark:bg-input/30"
                            >
                              <RadioGroupItem
                                value="private"
                                id="purpose-private"
                              />
                              <span className="leading-none">
                                <Trans>Private</Trans>
                              </span>
                            </Label>
                            <Label
                              htmlFor="purpose-business"
                              className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-input px-2.5 text-left text-sm font-normal transition-colors hover:bg-accent dark:bg-input/30"
                            >
                              <RadioGroupItem
                                value="business"
                                id="purpose-business"
                              />
                              <span className="leading-none">
                                <Trans>Business</Trans>
                              </span>
                            </Label>
                          </RadioGroup>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
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
                    <Controller
                      control={form.control}
                      name="booking_from"
                      rules={{ deps: ['booking_to'] }}
                      render={({ field }) => (
                        <Field className="gap-2">
                          <FieldLabel htmlFor={field.name}>
                            <Trans>Arrival</Trans>
                          </FieldLabel>
                          <DateTimeField
                            id={field.name}
                            label={t`Arrival`}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </Field>
                      )}
                    />

                    <Controller
                      control={form.control}
                      name="booking_to"
                      rules={{
                        validate: (value, values) =>
                          value > values.booking_from ||
                          t`Departure must be after arrival`
                      }}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="gap-2"
                        >
                          <FieldLabel htmlFor={field.name}>
                            <Trans>Departure</Trans>
                          </FieldLabel>
                          <DateTimeField
                            id={field.name}
                            label={t`Departure`}
                            value={field.value}
                            onChange={field.onChange}
                            invalid={fieldState.invalid}
                          />
                          {fieldState.invalid ? (
                            <FieldError errors={[fieldState.error]} />
                          ) : (
                            <FieldDescription aria-live="polite">
                              <Plural
                                value={Math.max(nights, 0)}
                                one="# night"
                                other="# nights"
                              />
                            </FieldDescription>
                          )}
                        </Field>
                      )}
                    />
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
