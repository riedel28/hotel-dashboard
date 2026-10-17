import { zodResolver } from '@hookform/resolvers/zod';
import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import {
  Controller,
  useController,
  useForm,
  type UseFormReturn,
  useWatch
} from 'react-hook-form';
import {
  checkinErrorCodes,
  type CheckinSettings,
  firstSendDaysOptions,
  reminderDaysOptions,
  type SaveCheckinSettingsData,
  saveCheckinSettingsSchema
} from 'shared/types/checkin';
import { toast } from 'sonner';

import { saveCheckinSettings } from '@/api/checkin';
import { CodedFieldError } from '@/components/coded-field-error';
import {
  type FormSectionDef,
  SectionedForm
} from '@/components/sectioned-form';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UnsavedChangesGuard } from '@/components/unsaved-changes-guard';

import { BackgroundPicker } from './background-picker';
import { CheckinHeader } from './checkin-header';

type CheckinForm = UseFormReturn<SaveCheckinSettingsData>;

/** The schema's codes in words. */
const errorMessages: Record<string, MessageDescriptor> = {
  [checkinErrorCodes.reminderNotBeforeFirstSend]: msg`The reminder must go out closer to arrival than the first send`
};

interface CheckinFormProps {
  settings: CheckinSettings;
  onSaved: (settings: CheckinSettings) => void;
  /** Switches online check-in off; the page then shows its empty state. */
  onDeactivate: () => Promise<unknown>;
  isDeactivating: boolean;
}

/** The settings of an activated online check-in. */
export function CheckinForm({
  settings,
  onSaved,
  onDeactivate,
  isDeactivating
}: CheckinFormProps) {
  const { t } = useLingui();
  const form = useForm<SaveCheckinSettingsData>({
    resolver: zodResolver(saveCheckinSettingsSchema),
    // Follows the saved settings, so the form is clean again after a save
    values: settings.settings,
    // The reminder's error shows as soon as the days no longer fit
    mode: 'onChange'
  });

  const mutation = useMutation({
    mutationFn: saveCheckinSettings,
    onSuccess: (saved) => {
      onSaved(saved);
      toast.success(t`Check-in settings saved`);
    },
    // The form keeps what was entered, to try again.
    onError: (error) => {
      console.error('Failed to save check-in settings:', error);
      toast.error(t`Failed to save check-in settings`, {
        description: error.message
      });
    }
  });

  const isDirty = form.formState.isDirty;

  return (
    <>
      <SectionedForm
        form={form}
        sections={sections}
        onSubmit={(values) => mutation.mutate(values)}
        isSaving={mutation.isPending}
        submitLabel={<Trans>Save</Trans>}
        header={
          <CheckinHeader
            guestUrl={settings.guest_url}
            hasUnsavedChanges={isDirty}
            onDeactivate={onDeactivate}
            isDeactivating={isDeactivating}
          />
        }
      />
      <UnsavedChangesGuard when={isDirty && !mutation.isPending} />
    </>
  );
}

const sections: FormSectionDef<SaveCheckinSettingsData>[] = [
  {
    id: 'delivery',
    label: <Trans>Sending to guests</Trans>,
    description: <Trans>When guests get the check-in link by email.</Trans>,
    fields: ['auto_send', 'first_send_days', 'reminder_days'],
    render: (form) => <DeliveryFields form={form} />
  },
  {
    id: 'background',
    label: <Trans>Page background</Trans>,
    description: (
      <Trans>The picture behind the check-in form in the guest app.</Trans>
    ),
    fields: ['background', 'custom_image_id'],
    render: (form) => <BackgroundField form={form} />
  }
];

// The reminder is checked against the first send, and only while links go
// out: either changing rechecks it.
const rechecksReminder = { deps: ['reminder_days' as const] };

function DeliveryFields({ form }: { form: CheckinForm }) {
  const { t } = useLingui();
  const autoSend = useWatch({ control: form.control, name: 'auto_send' });

  return (
    <FieldGroup>
      <Controller
        control={form.control}
        name="auto_send"
        rules={rechecksReminder}
        render={({ field }) => (
          <Field
            orientation="horizontal"
            className="items-center gap-3 rounded-lg border p-3 dark:bg-input/30"
          >
            <FieldContent>
              <FieldLabel htmlFor={field.name} className="cursor-pointer">
                <Trans>Send the check-in link automatically</Trans>
              </FieldLabel>
              <FieldDescription>
                <Trans>By email, at the times set below.</Trans>
              </FieldDescription>
            </FieldContent>
            <Switch
              id={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </Field>
        )}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Controller
          control={form.control}
          name="first_send_days"
          rules={rechecksReminder}
          render={({ field }) => (
            <Field data-disabled={!autoSend}>
              <FieldLabel htmlFor={field.name}>
                <Trans>First send</Trans>
              </FieldLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!autoSend}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue>
                    {(days: number) => <DaysBeforeArrival days={days} />}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {firstSendDaysOptions.map((days) => (
                    <SelectItem key={days} value={days}>
                      <DaysBeforeArrival days={days} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="reminder_days"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} data-disabled={!autoSend}>
              <FieldLabel htmlFor={field.name}>
                <Trans>Reminder</Trans>
              </FieldLabel>
              <Select<number | 'none'>
                // "none" stands for null, which the select reads as no choice
                value={field.value ?? 'none'}
                onValueChange={(value) =>
                  field.onChange(value === 'none' ? null : value)
                }
                disabled={!autoSend}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue>
                    {(value: number | 'none') =>
                      value === 'none' ? (
                        t`No reminder`
                      ) : (
                        <DaysBeforeArrival days={value} />
                      )
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <Trans>No reminder</Trans>
                  </SelectItem>
                  {reminderDaysOptions.map((days) => (
                    <SelectItem key={days} value={days}>
                      <DaysBeforeArrival days={days} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <CodedFieldError
                error={fieldState.error}
                messages={errorMessages}
              />
            </Field>
          )}
        />
      </div>

      {/* Under both selects, so the two stay level */}
      <FieldDescription className="-mt-3">
        {autoSend ? (
          <Trans>Reminders go only to guests who haven’t checked in yet.</Trans>
        ) : (
          <Trans>You can send the link by hand from a reservation.</Trans>
        )}
      </FieldDescription>
    </FieldGroup>
  );
}

function DaysBeforeArrival({ days }: { days: number }) {
  return (
    <Plural
      value={days}
      one="# day before arrival"
      other="# days before arrival"
    />
  );
}

// One picker, two fields: the uploaded image stays while a preset is picked.
// The picker only ever picks "custom" with an image, so the schema's rule
// for it guards the API, not this form.
function BackgroundField({ form }: { form: CheckinForm }) {
  const background = useController({
    control: form.control,
    name: 'background'
  });
  const image = useController({
    control: form.control,
    name: 'custom_image_id'
  });

  return (
    <BackgroundPicker
      background={background.field.value}
      customImageId={image.field.value}
      onChange={(next, customImageId) => {
        background.field.onChange(next);
        image.field.onChange(customImageId);
      }}
    />
  );
}
