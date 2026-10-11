import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRightIcon, Loader2Icon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  type Guest,
  type GuestAgeGroup,
  guestAgeGroupSchema,
  type ReservationFormData
} from 'shared/types/reservations';
import { toast } from 'sonner';

import { updateReservationById } from '@/api/reservations';
import { roomsQueryOptions } from '@/api/rooms';
import { FormSection } from '@/components/form-section';
import { type NavSection, SectionNav } from '@/components/section-nav';
import { StickyCardFooter } from '@/components/sticky-card-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { CountryFlag } from '@/components/ui/country-flag';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { RoomPicker } from '@/routes/_dashboard-layout/(user-view)/devices/-components/room-picker';
import { roomLabel } from '@/routes/_dashboard-layout/(user-view)/devices/-lib/rooms';

import { AddGuestModal } from './add-guest-modal';
import { countNights, DateTimeField } from './date-time-field';
import { EditGuestForm } from './edit-guest-form';
import { guestAgeGroupLabels } from './guest-age-group';
import { GuestSearchCombobox } from './guest-search-combobox';

interface EditReservationFormProps {
  reservationId: string;
  reservationData: ReservationFormData;
}

/** The head-count field each age group is planned in. */
const COUNT_FIELD = {
  adult: 'adults',
  youth: 'youth',
  child: 'children',
  infant: 'infants'
} as const satisfies Record<GuestAgeGroup, keyof ReservationFormData>;

/** With guests on the list one of them is the primary one: the first, failing a flag. */
function withPrimary(guests: Guest[]): Guest[] {
  if (guests.length === 0 || guests.some((guest) => guest.is_primary)) {
    return guests;
  }
  return guests.map((guest, index) => ({ ...guest, is_primary: index === 0 }));
}

export function EditReservationForm({
  reservationId,
  reservationData
}: EditReservationFormProps) {
  const queryClient = useQueryClient();
  const { t } = useLingui();
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  // The age group of the place a new guest is being added to
  const [addingToGroup, setAddingToGroup] = useState<GuestAgeGroup | null>(
    null
  );

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

  const guests = form.watch('guests');
  const counts = form.watch(['adults', 'youth', 'children', 'infants']);

  /** Guests named in each age group against the places planned for it. */
  const places = guestAgeGroupSchema.options.map((group, index) => {
    const named = guests.filter((guest) => guest.age_group === group).length;
    return { group, named, free: Math.max((counts[index] ?? 0) - named, 0) };
  });
  const plannedTotal = places.reduce(
    (total, { named, free }) => total + named + free,
    0
  );

  const setGuests = (next: Guest[]) => {
    form.setValue('guests', withPrimary(next), { shouldDirty: true });

    // A named guest is firmer than a number: the head counts grow to fit the
    // list, but never shrink — a guest who leaves frees their place.
    for (const group of guestAgeGroupSchema.options) {
      const named = next.filter((guest) => guest.age_group === group).length;
      if (named > form.getValues(COUNT_FIELD[group])) {
        form.setValue(COUNT_FIELD[group], named, { shouldDirty: true });
      }
    }
  };

  const handleRemoveGuest = (guestId: number) => {
    setGuests(guests.filter((guest) => guest.id !== guestId));
  };

  const handleEditGuest = (updatedGuest: Guest) => {
    setGuests(guests.map((g) => (g.id === updatedGuest.id ? updatedGuest : g)));
    setEditingGuest(null);
  };

  const handleMakePrimary = (guestId: number) => {
    setGuests(
      guests.map((guest) => ({ ...guest, is_primary: guest.id === guestId }))
    );
  };

  const handleAddGuest = (newGuest: Guest) => {
    setGuests([...guests, newGuest]);
  };

  // The search knows guests by name only: one found there takes the group
  // that still has places when there is just one such group.
  const handleAddFoundGuest = (found: Guest) => {
    const open = places.filter(({ free }) => free > 0);
    handleAddGuest({
      ...found,
      age_group: open.length === 1 && open[0] ? open[0].group : 'adult'
    });
  };

  // The primary guest leads the list
  const guestsInOrder = [...guests].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary)
  );

  const { data: roomsData } = useQuery(roomsQueryOptions({ per_page: 100 }));
  const rooms = roomsData?.index ?? [];

  const [bookingFrom, bookingTo] = form.watch(['booking_from', 'booking_to']);
  const nights = countNights(bookingFrom, bookingTo);
  const isDirty = form.formState.isDirty;
  const isSaving = updateReservationMutation.isPending;

  const peopleFields = [
    { name: 'adults', group: 'adult', label: t`Adults`, min: 1 },
    { name: 'youth', group: 'youth', label: t`Youth`, min: 0 },
    { name: 'children', group: 'child', label: t`Children`, min: 0 },
    { name: 'infants', group: 'infant', label: t`Infants`, min: 0 }
  ] as const;

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
                              // Focused like the inputs, also while its popup is open
                              className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)] data-popup-open:border-primary data-popup-open:shadow-[inset_0_0_0_1px_var(--color-primary)] dark:bg-input/30"
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
                  <div className="flex flex-col gap-6">
                    <FieldGroup className="grid grid-cols-2 gap-4 2xl:grid-cols-4">
                      {peopleFields.map(({ name, group, label, min }) => (
                        <Controller
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field, fieldState }) => (
                            <Field
                              data-invalid={fieldState.invalid}
                              className="gap-2"
                            >
                              <FieldLabel htmlFor={field.name}>
                                {label}
                              </FieldLabel>
                              <NumberInput
                                {...field}
                                id={field.name}
                                value={field.value}
                                // Never below the guests already named in the group
                                min={Math.max(
                                  min,
                                  places.find((p) => p.group === group)
                                    ?.named ?? 0
                                )}
                                onValueChange={(value) =>
                                  field.onChange(value ?? 0)
                                }
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                      ))}
                    </FieldGroup>

                    <div className="flex flex-col gap-2">
                      <div
                        className="text-sm text-muted-foreground"
                        aria-live="polite"
                      >
                        <Trans>
                          {guests.length} of {plannedTotal} guests registered
                        </Trans>
                      </div>

                      {/* Two ways to add a guest: find a known one or enter a new one */}
                      <div className="flex gap-2">
                        <div className="min-w-0 flex-1">
                          <GuestSearchCombobox
                            currentGuests={guests}
                            onSelectGuest={handleAddFoundGuest}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="shrink-0"
                          onClick={() => setAddingToGroup('adult')}
                        >
                          <PlusIcon aria-hidden="true" />
                          <Trans>New Guest</Trans>
                        </Button>
                      </div>

                      {guestsInOrder.map((guest) => (
                        <button
                          key={guest.id}
                          type="button"
                          // The whole card opens the guest for editing
                          className="group flex w-full cursor-pointer items-start gap-2.5 rounded-lg border border-input py-2 pr-3 pl-3 text-left transition-colors outline-none hover:border-foreground/5 hover:bg-accent focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)] dark:bg-input/30 dark:hover:bg-input/60"
                          onClick={() => setEditingGuest(guest)}
                        >
                          {/* As tall as the name's first line, so the flag centres on it */}
                          <span className="flex h-5 shrink-0 items-center">
                            <CountryFlag
                              code={guest.nationality_code}
                              className="size-4"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start gap-2">
                              <span className="line-clamp-2 text-sm wrap-anywhere">
                                {guest.first_name} {guest.last_name}
                              </span>
                              {guest.is_primary && (
                                <Badge
                                  size="xs"
                                  variant="outline"
                                  color="sky"
                                  className="mt-0.5 h-4 rounded-sm px-1 py-0"
                                >
                                  <Trans>Primary</Trans>
                                </Badge>
                              )}
                            </span>
                            {/* The email tells apart guests who share a name */}
                            <span className="line-clamp-2 text-xs wrap-anywhere text-muted-foreground">
                              {t(guestAgeGroupLabels[guest.age_group])}
                              {guest.email && ` · ${guest.email}`}
                            </span>
                          </span>
                          {/* Only while hovered or focused: where the click leads */}
                          <ChevronRightIcon
                            className="size-4 shrink-0 self-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                            aria-hidden="true"
                          />
                          <span className="sr-only">
                            <Trans>Edit guest</Trans>
                          </span>
                        </button>
                      ))}

                      {/* Places planned in the head counts that nobody is named for yet */}
                      {peopleFields.map(({ group, label }) => {
                        const free =
                          places.find((p) => p.group === group)?.free ?? 0;
                        if (free === 0) return null;

                        return (
                          <button
                            key={group}
                            type="button"
                            className="group flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-dashed border-input px-3 py-2 text-left text-sm text-muted-foreground transition-colors outline-none hover:border-transparent hover:bg-foreground/5 hover:text-foreground focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)]"
                            onClick={() => setAddingToGroup(group)}
                          >
                            <PlusIcon
                              className="size-4 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="min-w-0 flex-1 truncate">
                              {label} · <Trans>{free} not registered</Trans>
                            </span>
                            <span className="sr-only">
                              <Trans>Add guest</Trans>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
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

      {editingGuest && (
        <EditGuestForm
          key={editingGuest.id}
          guest={editingGuest}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingGuest(null);
          }}
          onSave={handleEditGuest}
          onRemove={() => handleRemoveGuest(editingGuest.id)}
          onMakePrimary={() => handleMakePrimary(editingGuest.id)}
        />
      )}

      {addingToGroup && (
        <AddGuestModal
          open={true}
          onOpenChange={(open) => {
            if (!open) setAddingToGroup(null);
          }}
          defaultAgeGroup={addingToGroup}
          onAddGuest={handleAddGuest}
        />
      )}
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
