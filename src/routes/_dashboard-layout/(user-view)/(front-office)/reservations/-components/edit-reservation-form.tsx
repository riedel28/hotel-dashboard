import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2Icon, Loader2Icon, Trash2Icon, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, type Path, useForm } from 'react-hook-form';
import type { Guest, ReservationFormData } from 'shared/types/reservations';
import { toast } from 'sonner';
import { z } from 'zod';

import { updateReservationById } from '@/api/reservations';
import { roomsQueryOptions } from '@/api/rooms';
import { FormSection } from '@/components/form-section';
import { type NavSection, SectionNav } from '@/components/section-nav';
import { StickyCardFooter } from '@/components/sticky-card-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { CountryPicker } from '@/components/ui/country-picker';
import { DataGridRowActions } from '@/components/ui/data-grid-row-actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
import { GuestSearchCombobox } from './guest-search-combobox';

interface EditReservationFormProps {
  reservationId: string;
  reservationData: ReservationFormData;
}

type PrimaryGuest = ReservationFormData['primary_guest'];

/** An untouched primary guest section means the reservation has none. */
function isBlank(guest: PrimaryGuest) {
  return Object.values(guest).every((value) => value.trim() === '');
}

export function EditReservationForm({
  reservationId,
  reservationData
}: EditReservationFormProps) {
  const queryClient = useQueryClient();
  const { t } = useLingui();
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const form = useForm<ReservationFormData>({
    values: reservationData
  });

  const updateReservationMutation = useMutation({
    mutationFn: ({ primary_guest, guests, ...data }: ReservationFormData) =>
      updateReservationById(reservationId, {
        ...data,
        // The server stores one guest list; the primary guest is a flag on it.
        guests: [
          ...(isBlank(primary_guest)
            ? []
            : [
                {
                  id: 0,
                  reservation_id: Number(reservationId),
                  first_name: primary_guest.first_name.trim(),
                  last_name: primary_guest.last_name.trim(),
                  email: primary_guest.email.trim() || null,
                  nationality_code: primary_guest.nationality_code,
                  is_primary: true,
                  created_at: new Date(),
                  updated_at: null
                }
              ]),
          ...guests.map((guest) => ({ ...guest, is_primary: false }))
        ]
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success(t`Reservation updated successfully`);
    },
    onError: (error) => {
      console.error('Failed to update reservation:', error);
      toast.error(t`Failed to update reservation. Please try again.`);
    }
  });

  const setGuests = (guests: Guest[]) =>
    form.setValue('guests', guests, { shouldDirty: true });

  const handleRemoveGuest = (guestId: number) => {
    setGuests(form.getValues('guests').filter((guest) => guest.id !== guestId));
  };

  const handleEditGuest = (updatedGuest: Guest) => {
    setGuests(
      form
        .getValues('guests')
        .map((g) => (g.id === updatedGuest.id ? updatedGuest : g))
    );
    setEditingGuest(null);
  };

  const handleAddGuest = (newGuest: Guest) => {
    setGuests([...form.getValues('guests'), newGuest]);
  };

  const { data: roomsData } = useQuery(roomsQueryOptions({ per_page: 100 }));
  const rooms = roomsData?.index ?? [];

  const [bookingFrom, bookingTo] = form.watch(['booking_from', 'booking_to']);
  const nights = countNights(bookingFrom, bookingTo);
  const isDirty = form.formState.isDirty;
  const isSaving = updateReservationMutation.isPending;

  // Required as soon as any field of the primary guest section is filled.
  const requiredForPrimaryGuest =
    (message: string) => (value: string, values: ReservationFormData) =>
      isBlank(values.primary_guest) || value.trim() !== '' || message;
  const primaryGuestFields: Path<ReservationFormData>[] = [
    'primary_guest.first_name',
    'primary_guest.last_name',
    'primary_guest.nationality_code'
  ];

  const peopleFields = [
    { name: 'adults', label: t`Adults`, min: 1 },
    { name: 'youth', label: t`Youth`, min: 0 },
    { name: 'children', label: t`Children`, min: 0 },
    { name: 'infants', label: t`Infants`, min: 0 }
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
                    <Trans>How many people are staying, by age group.</Trans>
                  }
                >
                  <FieldGroup className="grid grid-cols-2 gap-4 2xl:grid-cols-4">
                    {peopleFields.map(({ name, label, min }) => (
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
                              min={min}
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
                </FormSection>

                <Separator />

                <FormSection
                  id="primary-guest"
                  title={<Trans>Primary guest</Trans>}
                  description={
                    <Trans>
                      The person the reservation is booked under. Leave it empty
                      if they are not known yet.
                    </Trans>
                  }
                >
                  <FieldGroup className="gap-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Controller
                        control={form.control}
                        name="primary_guest.first_name"
                        rules={{
                          deps: primaryGuestFields,
                          validate: requiredForPrimaryGuest(
                            t`First name is required`
                          )
                        }}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="gap-2"
                          >
                            <FieldLabel htmlFor={field.name}>
                              <Trans>First name</Trans>
                            </FieldLabel>
                            <Input
                              {...field}
                              id={field.name}
                              autoComplete="off"
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="primary_guest.last_name"
                        rules={{
                          deps: primaryGuestFields,
                          validate: requiredForPrimaryGuest(
                            t`Last name is required`
                          )
                        }}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="gap-2"
                          >
                            <FieldLabel htmlFor={field.name}>
                              <Trans>Last name</Trans>
                            </FieldLabel>
                            <Input
                              {...field}
                              id={field.name}
                              autoComplete="off"
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    <Controller
                      control={form.control}
                      name="primary_guest.email"
                      rules={{
                        deps: primaryGuestFields,
                        validate: (value) =>
                          value.trim() === '' ||
                          z.email().safeParse(value.trim()).success ||
                          t`Invalid email address`
                      }}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="gap-2"
                        >
                          <FieldLabel htmlFor={field.name}>
                            <Trans>Email</Trans>
                          </FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            type="email"
                            autoComplete="off"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      control={form.control}
                      name="primary_guest.nationality_code"
                      rules={{
                        deps: primaryGuestFields,
                        validate: requiredForPrimaryGuest(
                          t`Nationality is required`
                        )
                      }}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="gap-2"
                        >
                          <FieldLabel>
                            <Trans>Nationality</Trans>
                          </FieldLabel>
                          <CountryPicker
                            value={field.value}
                            onValueChange={(value) =>
                              field.onChange(value ?? '')
                            }
                            aria-invalid={fieldState.invalid}
                          />
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
                  id="fellow-travelers"
                  title={<Trans>Fellow travelers</Trans>}
                  description={
                    <Trans>Everyone else staying on this reservation.</Trans>
                  }
                >
                  <div className="space-y-4">
                    <GuestSearchCombobox
                      currentGuests={form.watch('guests')}
                      onSelectGuest={handleAddGuest}
                    />
                    <Controller
                      control={form.control}
                      name="guests"
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="gap-2"
                        >
                          <div className="space-y-2">
                            {field.value.length === 0 ? (
                              <div className="flex h-10 items-center justify-center text-sm text-muted-foreground">
                                <Trans>No fellow travelers added yet</Trans>
                              </div>
                            ) : (
                              field.value.map((guest) => (
                                <div
                                  key={guest.id}
                                  className="flex items-center justify-between rounded-md border px-2 py-1"
                                >
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="max-w-md truncate text-sm">
                                      {guest.first_name} {guest.last_name}
                                    </span>
                                  </div>
                                  <DropdownMenu>
                                    <DataGridRowActions
                                      label={<Trans>Open guest menu</Trans>}
                                    />
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-[180px]"
                                    >
                                      <DropdownMenuItem
                                        onClick={() => {
                                          // Delay to allow dropdown to close first
                                          requestAnimationFrame(() => {
                                            setEditingGuest(guest);
                                          });
                                        }}
                                      >
                                        <Edit2Icon className="mr-2 h-4 w-4" />
                                        <Trans>Edit guest</Trans>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        variant="destructive-soft"
                                        onClick={() =>
                                          handleRemoveGuest(guest.id)
                                        }
                                      >
                                        <Trash2Icon className="mr-2 h-4 w-4" />
                                        <Trans>Remove</Trans>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ))
                            )}
                          </div>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <div className="flex justify-end">
                      <AddGuestModal onAddGuest={handleAddGuest} />
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
  { id: 'guests', label: <Trans>Guests</Trans> },
  { id: 'primary-guest', label: <Trans>Primary guest</Trans> },
  { id: 'fellow-travelers', label: <Trans>Fellow travelers</Trans> }
];
