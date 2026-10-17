import { zodResolver } from '@hookform/resolvers/zod';
import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowUpRightIcon,
  CheckIcon,
  CopyIcon,
  Loader2Icon,
  TriangleAlertIcon
} from 'lucide-react';
import * as React from 'react';
import {
  Controller,
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
import {
  type FormSectionDef,
  SectionedForm
} from '@/components/sectioned-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardAction, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { UnsavedChangesGuard } from '@/components/unsaved-changes-guard';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

import { BackgroundPicker } from './background-picker';

type CheckinFormValues = SaveCheckinSettingsData;
type CheckinFormApi = UseFormReturn<CheckinFormValues>;

/** The schema's codes in words. */
const errorMessages: Record<string, MessageDescriptor> = {
  [checkinErrorCodes.reminderNotBeforeFirstSend]: msg`The reminder must go out closer to arrival than the first send`,
  [checkinErrorCodes.customImageRequired]: msg`Upload an image or pick another background`
};

function CheckinFieldError({ error }: { error?: { message?: string } }) {
  const { t } = useLingui();
  const message = error?.message;
  if (!message) return null;
  const known = errorMessages[message];

  return <FieldError>{known ? t(known) : message}</FieldError>;
}

const formValues = ({
  enabled: _enabled,
  guest_url: _guestUrl,
  ...values
}: CheckinSettings): CheckinFormValues => values;

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
  const form = useForm<CheckinFormValues>({
    resolver: zodResolver(saveCheckinSettingsSchema),
    // Follows the saved settings, so the form is clean again after a save
    values: formValues(settings),
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

const sections: FormSectionDef<CheckinFormValues>[] = [
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

// Outside the form: these apply at once, not with Save.
function CheckinHeader({
  guestUrl,
  hasUnsavedChanges,
  onDeactivate,
  isDeactivating
}: {
  guestUrl: string | null;
  hasUnsavedChanges: boolean;
  onDeactivate: () => Promise<unknown>;
  isDeactivating: boolean;
}) {
  const { t } = useLingui();
  const { copy, copied } = useCopyToClipboard();
  const [confirming, setConfirming] = React.useState(false);
  const urlLabelId = React.useId();

  return (
    <CardHeader className="gap-4 border-b">
      <CardTitle className="flex items-center gap-2">
        <Trans>Online check-in</Trans>
        <Badge color="emerald" size="sm" className="rounded-md">
          <Trans>Active</Trans>
        </Badge>
      </CardTitle>
      {/* Rarely used and undoes the page: kept quiet */}
      <CardAction>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setConfirming(true)}
          disabled={isDeactivating}
        >
          <Trans>Deactivate</Trans>
        </Button>
      </CardAction>

      {guestUrl ? (
        <div className="col-span-full flex flex-col gap-2">
          <span id={urlLabelId} className="text-sm font-medium">
            <Trans>Link sent to guests</Trans>
          </span>
          {/* Text in a field's frame: something to copy, not to edit */}
          <div
            role="group"
            aria-labelledby={urlLabelId}
            className="flex h-9 items-center gap-0.5 rounded-lg border border-input bg-muted/50 ps-3 pe-1 dark:bg-input/30"
          >
            <span className="min-w-0 flex-1 truncate text-sm" title={guestUrl}>
              {guestUrl}
            </span>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={copied ? t`Link copied` : t`Copy link`}
                    onClick={async () => {
                      if (await copy(guestUrl)) toast.success(t`Link copied`);
                    }}
                  />
                }
              >
                {copied ? (
                  <CheckIcon
                    className="text-emerald-600 dark:text-emerald-300"
                    aria-hidden="true"
                  />
                ) : (
                  <CopyIcon aria-hidden="true" />
                )}
              </TooltipTrigger>
              <TooltipContent>
                <Trans>Copy link</Trans>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    aria-label={t`Preview (opens in new tab)`}
                    render={
                      <a
                        href={guestUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  />
                }
              >
                <ArrowUpRightIcon aria-hidden="true" />
              </TooltipTrigger>
              <TooltipContent>
                <Trans>Preview</Trans>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      ) : (
        // As quiet as the reservation form's info note, in the warning colour
        <Alert
          variant="warning"
          role="note"
          className="col-span-full border-foreground/10 px-3 py-2 dark:border-foreground/10 dark:bg-amber-800/20 dark:text-amber-300"
        >
          <TriangleAlertIcon aria-hidden="true" />
          <AlertDescription>
            <Trans>
              This property has no guest app domain yet, so the check-in links
              won’t work. An administrator sets it in the property’s settings.
            </Trans>
          </AlertDescription>
        </Alert>
      )}

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans>Deactivate online check-in?</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>Guests will no longer receive check-in links.</Trans>{' '}
              {hasUnsavedChanges && (
                <Trans>Your unsaved changes will be lost.</Trans>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>
              <Trans>Cancel</Trans>
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive-soft"
              disabled={isDeactivating}
              onClick={() =>
                // Success swaps the page for its empty state; a failure is
                // toasted by the page.
                void onDeactivate().catch(() => setConfirming(false))
              }
            >
              {isDeactivating && (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              )}
              <Trans>Deactivate</Trans>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CardHeader>
  );
}

function DeliveryFields({ form }: { form: CheckinFormApi }) {
  const { t } = useLingui();
  const autoSend = useWatch({ control: form.control, name: 'auto_send' });
  // The reminder is checked against the first send: recheck it with each.
  const revalidateReminder = () => void form.trigger('reminder_days');

  return (
    <FieldGroup>
      <Controller
        control={form.control}
        name="auto_send"
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
              onCheckedChange={(checked) => {
                field.onChange(checked);
                revalidateReminder();
              }}
            />
          </Field>
        )}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Controller
          control={form.control}
          name="first_send_days"
          render={({ field }) => (
            <Field data-disabled={!autoSend}>
              <FieldLabel htmlFor={field.name}>
                <Trans>First send</Trans>
              </FieldLabel>
              <Select
                value={field.value}
                onValueChange={(days) => {
                  if (days === null) return;
                  field.onChange(days);
                  revalidateReminder();
                }}
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
              <CheckinFieldError error={fieldState.error} />
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

function BackgroundField({ form }: { form: CheckinFormApi }) {
  return (
    <Controller
      control={form.control}
      name="background"
      render={({ field, fieldState }) => (
        <Controller
          control={form.control}
          name="custom_image_id"
          render={({ field: image, fieldState: imageState }) => (
            <Field data-invalid={fieldState.invalid || imageState.invalid}>
              <BackgroundPicker
                background={field.value}
                customImageId={image.value}
                onChange={(background, customImageId) => {
                  field.onChange(background);
                  image.onChange(customImageId);
                }}
              />
              <CheckinFieldError error={imageState.error} />
            </Field>
          )}
        />
      )}
    />
  );
}
