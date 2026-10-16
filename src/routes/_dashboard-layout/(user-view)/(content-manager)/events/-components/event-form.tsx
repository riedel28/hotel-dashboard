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
  type FieldPath,
  useForm,
  type UseFormReturn,
  useWatch
} from 'react-hook-form';
import { eventImageMaxBytes, eventImagesMax } from 'shared/types/events';
import type { Property } from 'shared/types/properties';
import { toast } from 'sonner';

import {
  createEvent,
  eventByIdQueryOptions,
  invalidateEvents,
  updateEvent,
  uploadEventImage
} from '@/api/events';
import { scrollPageToTop } from '@/components/section-nav';
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

import {
  doorsLeadMinutes,
  doorsPresets,
  doorsTimeBefore,
  durationMinutes,
  eventFormErrors,
  eventFormSchema,
  type EventFormValues,
  formValuesToSaveData,
  hotelAddress,
  splitMinutes
} from '../-lib/event-form';
import { UnsavedChangesGuard } from '../../../profile/-components/profile-section';
import { ImageField } from '../../mobile-cms/-components/image-field';
import { CategoryPicker } from './category-picker';
import { WallClockField } from './wall-clock-field';

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

/** The schema's codes in words: "required" by field, the rest as they are. */
const requiredMessages: Partial<
  Record<FieldPath<EventFormValues>, MessageDescriptor>
> = {
  title: msg`Title is required`,
  venue_name: msg`Venue name is required`,
  address_line_1: msg`Street is required`,
  zip: msg`Postal code is required`,
  city: msg`City is required`,
  country_code: msg`Country is required`
};

const ruleMessages: Record<string, MessageDescriptor> = {
  [eventFormErrors.startRequired]: msg`Start date and time are required`,
  [eventFormErrors.endRequired]: msg`End date and time are required`,
  [eventFormErrors.endOrder]: msg`The end must be after the start`,
  [eventFormErrors.doorsOrder]: msg`Doors must open before the start`
};

function EventFieldError({
  name,
  error
}: {
  name: FieldPath<EventFormValues>;
  error?: { message?: string };
}) {
  const { t } = useLingui();
  const message = error?.message;
  if (!message) return null;
  const known =
    message === eventFormErrors.required
      ? requiredMessages[name]
      : ruleMessages[message];

  return <FieldError>{known ? t(known) : message}</FieldError>;
}

interface EventFormProps {
  property: HotelInfo;
  /** Absent for a new event. */
  eventId?: number;
  /** The event's values, or what a new one starts with (e.g. a duplicate). */
  initialValues: EventFormValues;
}

/** Creates or updates an event; one form for both. */
export function EventForm({
  property,
  eventId,
  initialValues
}: EventFormProps) {
  const isNew = eventId === undefined;
  const { t } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const zone = property.timezone;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    // An edit form follows the saved event, so it is clean again after Update
    ...(isNew ? { defaultValues: initialValues } : { values: initialValues })
  });

  const save = useMutation({
    mutationFn: (values: EventFormValues) => {
      const data = formValuesToSaveData(values, zone);
      return isNew ? createEvent(data) : updateEvent(eventId, data);
    },
    onSuccess: (event) => {
      queryClient.setQueryData(eventByIdQueryOptions(event.id).queryKey, event);
      void invalidateEvents(queryClient);
      if (isNew) {
        toast.success(t`Event created`);
        scrollPageToTop();
        void navigate({
          to: '/events/$eventId',
          params: { eventId: String(event.id) },
          ignoreBlocker: true
        });
      } else {
        toast.success(t`Event updated`);
      }
    },
    onError: (error) => {
      console.error('Failed to save event:', error);
      toast.error(
        isNew ? t`Failed to create event` : t`Failed to update event`,
        { description: error.message }
      );
    }
  });

  // A created event keeps the form disabled until its own page takes over
  const isSaving = save.isPending || (isNew && save.isSuccess);
  const isDirty = form.formState.isDirty;
  const sections = useMemo(() => eventSections(property), [property]);

  return (
    <>
      <SectionedForm
        form={form}
        sections={sections}
        onSubmit={(values) => save.mutate(values)}
        isSaving={isSaving}
        isNew={isNew}
        submitLabel={
          isNew ? <Trans>Create event</Trans> : <Trans>Update event</Trans>
        }
        status={
          isSaving ? (
            <Trans>Saving changes…</Trans>
          ) : isDirty ? (
            <Trans>Unsaved changes</Trans>
          ) : (
            <Trans>No unsaved changes</Trans>
          )
        }
        // A new event has nothing to go back to: Cancel leaves for the list
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
      <UnsavedChangesGuard when={isDirty && !isSaving} />
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
    fields: ['start_date', 'start_time', 'end_date', 'end_time', 'doors_time'],
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
          <EventFieldError name={name} error={fieldState.error} />
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
  const values = useWatch({ control: form.control }) as EventFormValues;
  const duration = durationMinutes(values, zone);
  const doorsLead = doorsLeadMinutes(values);
  // Later fields are checked again as earlier ones change, once submitted
  const touch = {
    shouldDirty: true,
    shouldValidate: form.formState.isSubmitted
  };

  return (
    <FieldGroup className="gap-4">
      <Controller
        control={form.control}
        name="start_date"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={field.name}>
              <Trans>Start</Trans>
            </FieldLabel>
            <WallClockField
              ref={field.ref}
              id={field.name}
              label={t`Start`}
              date={field.value}
              time={values.start_time}
              onDateChange={(date) => {
                field.onChange(date);
                // An end not picked yet starts on the same day
                if (!form.getValues('end_date')) {
                  form.setValue('end_date', date, touch);
                }
                if (form.formState.isSubmitted) {
                  void form.trigger(['end_date', 'doors_time']);
                }
              }}
              onTimeChange={(time) => {
                form.setValue('start_time', time, touch);
                if (form.formState.isSubmitted) {
                  void form.trigger(['start_date', 'end_date', 'doors_time']);
                }
              }}
              invalid={fieldState.invalid}
            />
            <EventFieldError name="start_date" error={fieldState.error} />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="end_date"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={field.name}>
              <Trans>End</Trans>
            </FieldLabel>
            <WallClockField
              ref={field.ref}
              id={field.name}
              label={t`End`}
              date={field.value}
              time={values.end_time}
              onDateChange={field.onChange}
              onTimeChange={(time) => {
                form.setValue('end_time', time, touch);
                if (form.formState.isSubmitted) void form.trigger('end_date');
              }}
              invalid={fieldState.invalid}
            />
            <EventFieldError name="end_date" error={fieldState.error} />
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
                const time = doorsTimeBefore(values.start_time, minutes);
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
            <EventFieldError name="doors_time" error={fieldState.error} />
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
      <div className="flex flex-col items-start gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!address}
          onClick={() => {
            if (!address) return;
            for (const [name, value] of Object.entries(address)) {
              form.setValue(name as keyof typeof address, value, {
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
            <EventFieldError name="country_code" error={fieldState.error} />
          </Field>
        )}
      />
    </FieldGroup>
  );
}
