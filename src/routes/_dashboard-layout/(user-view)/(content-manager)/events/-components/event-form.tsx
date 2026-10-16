import { zodResolver } from '@hookform/resolvers/zod';
import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { MapPinIcon } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';
import {
  Controller,
  useForm,
  type UseFormReturn,
  useWatch
} from 'react-hook-form';
import {
  eventErrorCodes,
  eventImageMaxBytes,
  eventImagesMax,
  type HotelEvent,
  type SaveEventData
} from 'shared/types/events';
import type { Property } from 'shared/types/properties';
import { toast } from 'sonner';

import { onEventSaved, uploadEventImage } from '@/api/events';
import { DateTimeField } from '@/components/date-time-field';
import { ImageField } from '@/components/image-field';
import {
  type FormSectionDef,
  SectionedForm
} from '@/components/sectioned-form';
import { Button } from '@/components/ui/button';
import { CountryPicker } from '@/components/ui/country-picker';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { TimeInput } from '@/components/ui/time-input';
import { Toggle } from '@/components/ui/toggle';
import { UnsavedChangesGuard } from '@/components/unsaved-changes-guard';

import {
  addressFieldNames,
  doorsLeadMinutes,
  doorsPresets,
  doorsTimeBefore,
  durationMinutes,
  eventFormSchema,
  type EventFormValues,
  formValuesToSaveData,
  hotelAddress,
  splitMinutes
} from '../-lib/event-form';
import { CategoryPicker } from './category-picker';

type EventForm = UseFormReturn<EventFormValues>;
type HotelInfo = Pick<
  Property,
  | 'timezone'
  | 'address_line_1'
  | 'address_line_2'
  | 'zip'
  | 'city'
  | 'country_code'
>;

/** The schemas' codes in words. */
const errorMessages: Record<string, MessageDescriptor> = {
  [eventErrorCodes.titleRequired]: msg`Title is required`,
  [eventErrorCodes.venueRequired]: msg`Venue name is required`,
  [eventErrorCodes.streetRequired]: msg`Street is required`,
  [eventErrorCodes.zipRequired]: msg`Postal code is required`,
  [eventErrorCodes.cityRequired]: msg`City is required`,
  [eventErrorCodes.countryRequired]: msg`Country is required`,
  [eventErrorCodes.startRequired]: msg`Start date and time are required`,
  [eventErrorCodes.endRequired]: msg`End date and time are required`,
  [eventErrorCodes.endOrder]: msg`The end must be after the start`,
  [eventErrorCodes.doorsOrder]: msg`Doors must open before the start`
};

function EventFieldError({ error }: { error?: { message?: string } }) {
  const { t } = useLingui();
  const message = error?.message;
  if (!message) return null;
  const known = errorMessages[message];

  return <FieldError>{known ? t(known) : message}</FieldError>;
}

interface EventFormProps {
  property: HotelInfo;
  /** The event's values, or what a new one starts with (e.g. a duplicate). */
  initialValues: EventFormValues;
  /** Saves the form's data; the page knows whether that creates or updates. */
  save: (data: SaveEventData) => Promise<HotelEvent>;
  onSaved: (event: HotelEvent) => void;
  submitLabel: ReactNode;
  /**
   * An event not saved yet: it can be submitted untouched, Cancel leaves for
   * the list, and the form stays busy until the page moves on.
   */
  isNew?: boolean;
}

/** An event's form, for a new one and an existing one alike. */
export function EventForm({
  property,
  initialValues,
  save,
  onSaved,
  submitLabel,
  isNew = false
}: EventFormProps) {
  const { t } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    // Follows the saved event, so the form is clean again after a save
    values: initialValues
  });

  const mutation = useMutation({
    mutationFn: (values: EventFormValues) =>
      save(formValuesToSaveData(values, property.timezone)),
    onSuccess: (event) => {
      void onEventSaved(queryClient, event);
      onSaved(event);
    },
    onError: (error) => {
      console.error('Failed to save event:', error);
      toast.error(t`Failed to save event`, { description: error.message });
    }
  });

  const isSaving = mutation.isPending || (isNew && mutation.isSuccess);
  const sections = useMemo(() => eventSections(property), [property]);

  return (
    <>
      <SectionedForm
        form={form}
        sections={sections}
        onSubmit={(values) => mutation.mutate(values)}
        isSaving={isSaving}
        isNew={isNew}
        submitLabel={submitLabel}
        {...(isNew && {
          secondaryAction: (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void navigate({ to: '/events', ignoreBlocker: true })
              }
              disabled={isSaving}
            >
              <Trans>Cancel</Trans>
            </Button>
          )
        })}
      />
      <UnsavedChangesGuard when={form.formState.isDirty && !isSaving} />
    </>
  );
}

const eventSections = (
  property: HotelInfo
): FormSectionDef<EventFormValues>[] => [
  {
    id: 'basics',
    label: <Trans>Basics</Trans>,
    description: <Trans>Title, description and categories.</Trans>,
    fields: ['title', 'description', 'categories'],
    render: (form) => <BasicsFields form={form} />
  },
  {
    id: 'date-time',
    label: <Trans>Date & time</Trans>,
    description: (
      <Trans>
        When it starts, when it ends and when guests are let in. Times are in
        the hotel’s timezone, {property.timezone.replaceAll('_', ' ')}.
      </Trans>
    ),
    fields: ['start', 'end', 'doors_time'],
    render: (form) => <DateTimeFields form={form} zone={property.timezone} />
  },
  {
    id: 'location',
    label: <Trans>Location</Trans>,
    description: <Trans>Where the event takes place.</Trans>,
    fields: [
      'venue_name',
      'address_line_1',
      'address_line_2',
      'zip',
      'city',
      'country_code'
    ],
    render: (form) => <LocationFields form={form} property={property} />
  },
  {
    id: 'images',
    label: <Trans>Images</Trans>,
    description: (
      <Trans>
        The first image is the cover. Drag the images to change their order.
        JPG, PNG or WebP, up to 5 MB each.
      </Trans>
    ),
    fields: ['image_ids'],
    render: (form) => (
      <Controller
        control={form.control}
        name="image_ids"
        render={({ field }) => (
          <ImageField
            value={field.value}
            onChange={field.onChange}
            max={eventImagesMax}
            maxBytes={eventImageMaxBytes}
            upload={uploadEventImage}
            cover
          />
        )}
      />
    )
  }
];

function TextField({
  form,
  name,
  label,
  autoComplete
}: {
  form: EventForm;
  name:
    | 'title'
    | 'venue_name'
    | 'address_line_1'
    | 'address_line_2'
    | 'zip'
    | 'city';
  label: ReactNode;
  autoComplete?: string;
}) {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-2">
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...field}
            id={field.name}
            autoComplete={autoComplete}
            aria-invalid={fieldState.invalid}
          />
          <EventFieldError error={fieldState.error} />
        </Field>
      )}
    />
  );
}

function BasicsFields({ form }: { form: EventForm }) {
  const { t } = useLingui();

  return (
    <FieldGroup className="gap-4">
      <TextField form={form} name="title" label={<Trans>Title</Trans>} />
      <Controller
        control={form.control}
        name="description"
        render={({ field }) => (
          <Field className="gap-2">
            <FieldLabel htmlFor={field.name}>
              <Trans>Description</Trans>
            </FieldLabel>
            <RichTextEditor
              id={field.name}
              variant="cms"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-label={t`Description`}
            />
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="categories"
        render={({ field }) => (
          <Field className="gap-2">
            <FieldLabel htmlFor={field.name}>
              <Trans>Categories</Trans>
            </FieldLabel>
            <CategoryPicker
              ref={field.ref}
              id={field.name}
              value={field.value}
              onValueChange={field.onChange}
            />
          </Field>
        )}
      />
    </FieldGroup>
  );
}

function DurationText({ minutes }: { minutes: number }) {
  const { t } = useLingui();
  const { days, hours, minutes: rest } = splitMinutes(minutes);

  return [
    days > 0 && t`${days} d`,
    hours > 0 && t`${hours} h`,
    (rest > 0 || minutes === 0) && t`${rest} min`
  ]
    .filter(Boolean)
    .join(' ');
}

function DateTimeFields({ form, zone }: { form: EventForm; zone: string }) {
  const { t } = useLingui();
  const [start, end, doorsTime] = useWatch({
    control: form.control,
    name: ['start', 'end', 'doors_time']
  });
  const duration = durationMinutes(start, end, zone);
  const doorsLead = doorsLeadMinutes(start.time, doorsTime);

  return (
    <FieldGroup className="gap-4">
      <Controller
        control={form.control}
        name="start"
        // The end and the doors are checked against the start
        rules={{ deps: ['end', 'doors_time'] }}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={field.name}>
              <Trans>Start</Trans>
            </FieldLabel>
            <DateTimeField
              ref={field.ref}
              id={field.name}
              label={t`Start`}
              value={field.value}
              onChange={(next) => {
                field.onChange(next);
                // An end not picked yet starts on the same day
                const endNow = form.getValues('end');
                if (next.date && !endNow.date) {
                  form.setValue(
                    'end',
                    { ...endNow, date: next.date },
                    { shouldDirty: true }
                  );
                }
              }}
              invalid={fieldState.invalid}
            />
            <EventFieldError error={fieldState.error} />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="end"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={field.name}>
              <Trans>End</Trans>
            </FieldLabel>
            <DateTimeField
              ref={field.ref}
              id={field.name}
              label={t`End`}
              value={field.value}
              onChange={field.onChange}
              invalid={fieldState.invalid}
            />
            <EventFieldError error={fieldState.error} />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="doors_time"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={field.name}>
              <Trans>Doors open</Trans>
            </FieldLabel>
            <div className="max-w-36">
              <TimeInput
                id={field.name}
                aria-label={t`Doors open time`}
                aria-invalid={fieldState.invalid}
                value={field.value}
                onValueChange={field.onChange}
                clearable
              />
            </div>
            {/* Quick picks from the start time; the field keeps the time */}
            <div className="mt-1 flex flex-wrap gap-1.5">
              {doorsPresets.map((minutes) => {
                const time = doorsTimeBefore(start.time, minutes);
                return (
                  <Toggle
                    key={minutes}
                    className="h-6 min-w-0 bg-muted/60 px-2 text-xs font-normal text-muted-foreground hover:bg-muted hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:ring-1 aria-pressed:ring-foreground/10 dark:bg-input/40 dark:aria-pressed:bg-input/40"
                    disabled={!time}
                    pressed={time !== null && field.value === time}
                    // Pressed again, it takes the doors time back out
                    onPressedChange={(pressed) =>
                      field.onChange(pressed && time ? time : '')
                    }
                  >
                    {minutes < 60 ? (
                      <Trans>{minutes} min before</Trans>
                    ) : (
                      <Trans>{minutes / 60} h before</Trans>
                    )}
                  </Toggle>
                );
              })}
            </div>
            <EventFieldError error={fieldState.error} />
          </Field>
        )}
      />

      {(duration !== null || doorsLead !== null) && (
        <FieldDescription aria-live="polite">
          {duration !== null && duration > 0 && (
            <DurationText minutes={duration} />
          )}
          {duration !== null && duration > 0 && doorsLead !== null && ' · '}
          {doorsLead !== null &&
            doorsLead >= 0 &&
            (doorsLead === 0 ? (
              <Trans>doors open at the start</Trans>
            ) : (
              <Trans>
                doors open <DurationText minutes={doorsLead} /> before start
              </Trans>
            ))}
        </FieldDescription>
      )}
    </FieldGroup>
  );
}

function LocationFields({
  form,
  property
}: {
  form: EventForm;
  property: HotelInfo;
}) {
  const { t } = useLingui();
  const address = hotelAddress(property);

  return (
    <FieldGroup className="gap-4">
      <div className="flex flex-col items-start gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!address}
          onClick={() => {
            if (!address) return;
            for (const name of addressFieldNames) {
              form.setValue(name, address[name], {
                shouldDirty: true,
                shouldValidate: form.formState.isSubmitted
              });
            }
          }}
        >
          <MapPinIcon />
          <Trans>Use hotel address</Trans>
        </Button>
        {!address && (
          <p className="text-xs text-muted-foreground">
            <Trans>
              The hotel has no address yet. An administrator can add it in the
              property settings.
            </Trans>
          </p>
        )}
      </div>
      <TextField
        form={form}
        name="venue_name"
        label={<Trans>Venue name</Trans>}
      />
      <TextField
        form={form}
        name="address_line_1"
        label={<Trans>Street</Trans>}
        autoComplete="address-line1"
      />
      <TextField
        form={form}
        name="address_line_2"
        label={<Trans>Address line 2</Trans>}
        autoComplete="address-line2"
      />
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <TextField
          form={form}
          name="zip"
          label={<Trans>Postal code</Trans>}
          autoComplete="postal-code"
        />
        <TextField
          form={form}
          name="city"
          label={<Trans>City</Trans>}
          autoComplete="address-level2"
        />
      </div>
      <Controller
        control={form.control}
        name="country_code"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel id="event-country-label">
              <Trans>Country</Trans>
            </FieldLabel>
            <CountryPicker
              value={field.value}
              onValueChange={(code) => field.onChange(code ?? '')}
              placeholder={t`Select country`}
              aria-labelledby="event-country-label"
              aria-invalid={fieldState.invalid}
            />
            <EventFieldError error={fieldState.error} />
          </Field>
        )}
      />
    </FieldGroup>
  );
}
