import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { Controller, type UseFormReturn } from 'react-hook-form';
import {
  reservationErrorCodes,
  type ReservationFormData
} from 'shared/types/reservations';

import { deviceRoomOptionsQueryOptions } from '@/api/devices';
import { RoomPicker } from '@/components/room-picker';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field';
import { fieldTriggerClassName } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { roomLabel } from '@/lib/rooms';

import { countNights } from '../-lib/stay';
import { DateTimeField } from './date-time-field';

/** The schema's error codes in words; any other message is shown as it is. */
const errorMessages: Record<string, MessageDescriptor> = {
  [reservationErrorCodes.roomRequired]: msg`Room selection is required`,
  [reservationErrorCodes.stayOrder]: msg`Departure must be after arrival`
};

function ReservationFieldError({ error }: { error?: { message?: string } }) {
  const { t } = useLingui();
  const message = error?.message;
  const known = message ? errorMessages[message] : undefined;

  return <FieldError>{known ? t(known) : message}</FieldError>;
}

/**
 * The fields the add and the edit form share. The form's schema decides what
 * is valid and names each broken rule by a code.
 */
interface ReservationFieldProps {
  form: UseFormReturn<ReservationFormData>;
}

export function RoomField({ form }: ReservationFieldProps) {
  // The picker's own list, so the selected room is shown the way it is offered
  const { data: rooms = [] } = useQuery(deviceRoomOptionsQueryOptions());

  return (
    <Controller
      control={form.control}
      name="room_name"
      render={({ field, fieldState }) => {
        const selectedRoom = rooms.find((room) => room.name === field.value);

        return (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={field.name}>
              <Trans>Room</Trans>
            </FieldLabel>
            <RoomPicker
              ref={field.ref}
              id={field.name}
              value={selectedRoom ?? null}
              onValueChange={(room) => field.onChange(room.name)}
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
                      selectedRoom.name !== selectedRoom.room_number && (
                        <span className="truncate text-muted-foreground">
                          {selectedRoom.name}
                        </span>
                      )}
                  </>
                ) : field.value ? (
                  // Kept as stored: it names no room of the property.
                  <span className="truncate">{field.value}</span>
                ) : (
                  <span className="text-muted-foreground">
                    <Trans>Select a room</Trans>
                  </span>
                )}
              </span>
            </RoomPicker>
            <ReservationFieldError error={fieldState.error} />
          </Field>
        );
      }}
    />
  );
}

export function PurposeField({ form }: ReservationFieldProps) {
  return (
    <Controller
      control={form.control}
      name="purpose"
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-2">
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
              <RadioGroupItem value="private" id="purpose-private" />
              <span className="leading-none">
                <Trans>Private</Trans>
              </span>
            </Label>
            <Label
              htmlFor="purpose-business"
              className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-input px-2.5 text-left text-sm font-normal transition-colors hover:bg-accent dark:bg-input/30"
            >
              <RadioGroupItem value="business" id="purpose-business" />
              <span className="leading-none">
                <Trans>Business</Trans>
              </span>
            </Label>
          </RadioGroup>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

/** Arrival and departure, with the nights between them. */
export function StayFields({ form }: ReservationFieldProps) {
  const { t } = useLingui();
  const [bookingFrom, bookingTo] = form.watch(['booking_from', 'booking_to']);
  const nights = countNights(bookingFrom, bookingTo);

  return (
    <>
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
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={field.name}>
              <Trans>Departure</Trans>
            </FieldLabel>
            <DateTimeField
              ref={field.ref}
              id={field.name}
              label={t`Departure`}
              value={field.value}
              onChange={field.onChange}
              invalid={fieldState.invalid}
            />
            {fieldState.invalid ? (
              <ReservationFieldError error={fieldState.error} />
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
    </>
  );
}
