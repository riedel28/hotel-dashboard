import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { CircleAlertIcon, Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  claimDeviceSchema,
  type Device,
  DEVICE_PIN_LENGTH,
  deviceRoomSchema
} from 'shared/types/devices';
import { toast } from 'sonner';
import { z } from 'zod';

import { ApiError } from '@/api/client';
import { claimDevice, devicesQueryOptions } from '@/api/devices';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from '@/components/ui/input-otp';

import { roomLabel } from '../-lib/devices';
import { RoomPicker } from './room-picker';

const claimFormSchema = claimDeviceSchema
  .pick({ serial_number: true, pin: true })
  .extend({ name: z.string(), room: deviceRoomSchema.nullable() });

type ClaimFormData = z.infer<typeof claimFormSchema>;

// The PIN is shown on the device in three groups of four
const PIN_GROUP_SIZE = 4;
const pinGroups = Array.from(
  { length: DEVICE_PIN_LENGTH / PIN_GROUP_SIZE },
  (_, group) =>
    Array.from(
      { length: PIN_GROUP_SIZE },
      (_, slot) => group * PIN_GROUP_SIZE + slot
    )
);

interface ClaimDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaimed: (device: Device) => void;
}

export function ClaimDeviceModal({
  open,
  onOpenChange,
  onClaimed
}: ClaimDeviceModalProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  // An error no field can show
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    // Validated as typed: Add stays disabled until the form is valid
    mode: 'onChange',
    defaultValues: { serial_number: '', pin: '', name: '', room: null }
  });

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      form.reset();
      setFormError(null);
    }
  };

  const claimMutation = useMutation({
    mutationFn: ({ room, ...data }: ClaimFormData) =>
      claimDevice({ ...data, room_id: room?.id ?? null }),
    onSuccess: async (device) => {
      await queryClient.invalidateQueries({
        queryKey: devicesQueryOptions().queryKey
      });
      handleOpenChange(false);
      toast.success(t`Device added`);
      onClaimed(device);
    },
    // What was typed stays in the form, whatever the error
    onError: (error) => {
      const code = error instanceof ApiError ? error.code : undefined;
      if (code === 'SERIAL_NOT_FOUND') {
        form.setError('serial_number', {
          type: 'server',
          message: t`No device with this serial number was found`
        });
      } else if (code === 'DEVICE_ALREADY_CLAIMED') {
        form.setError('serial_number', {
          type: 'server',
          message: t`This device has already been added`
        });
      } else if (code === 'INVALID_PIN') {
        form.setError('pin', {
          type: 'server',
          message: t`The PIN is incorrect`
        });
      } else if (error instanceof ApiError && error.status === 429) {
        setFormError(t`Too many attempts. Please try again later.`);
      } else {
        setFormError(t`The device could not be added. Please try again.`);
      }
    }
  });

  const onSubmit = (data: ClaimFormData) => {
    setFormError(null);
    claimMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Add device</Trans>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldSet className="gap-6">
            <FieldGroup className="gap-4">
              {formError && (
                <Alert variant="destructive">
                  <CircleAlertIcon />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <Controller
                control={form.control}
                name="serial_number"
                render={({ field, fieldState }) => {
                  // Only what the server said: the format is enforced by
                  // keeping Add disabled, not by errors while typing
                  const serverError =
                    fieldState.error?.type === 'server' && fieldState.error;
                  return (
                    <Field
                      data-invalid={Boolean(serverError)}
                      className="gap-2"
                    >
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Serial number</Trans>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        {...field}
                        required
                        autoComplete="off"
                        spellCheck={false}
                        aria-invalid={Boolean(serverError)}
                        className="font-mono"
                      />
                      {serverError && <FieldError errors={[serverError]} />}
                    </Field>
                  );
                }}
              />

              <Controller
                control={form.control}
                name="pin"
                render={({ field, fieldState }) => {
                  const serverError =
                    fieldState.error?.type === 'server' && fieldState.error;
                  return (
                    <Field
                      data-invalid={Boolean(serverError)}
                      className="gap-2"
                    >
                      <FieldLabel htmlFor={field.name}>
                        <Trans>PIN</Trans>
                      </FieldLabel>
                      <InputOTP
                        id={field.name}
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        maxLength={DEVICE_PIN_LENGTH}
                        required
                        inputMode="numeric"
                        autoComplete="off"
                        pattern={REGEXP_ONLY_DIGITS}
                        // A code copied with its dashes or spaces still pastes
                        pasteTransformer={(text) => text.replace(/\D/g, '')}
                        aria-invalid={Boolean(serverError)}
                        aria-describedby="device-pin-hint"
                        containerClassName="w-full gap-1.5"
                      >
                        {pinGroups.map((slots, group) => (
                          <div key={group} className="contents">
                            {group > 0 && (
                              <InputOTPSeparator className="text-muted-foreground" />
                            )}
                            <InputOTPGroup className="min-w-0 flex-1 gap-1">
                              {slots.map((slot) => (
                                <InputOTPSlot
                                  key={slot}
                                  index={slot}
                                  className="h-10 w-auto min-w-0 flex-1 font-mono"
                                />
                              ))}
                            </InputOTPGroup>
                          </div>
                        ))}
                      </InputOTP>
                      <FieldDescription id="device-pin-hint">
                        <Trans>The code is shown on the device screen</Trans>
                      </FieldDescription>
                      {serverError && <FieldError errors={[serverError]} />}
                    </Field>
                  );
                }}
              />

              <Controller
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Field className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Name</Trans>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      {...field}
                      autoComplete="off"
                      maxLength={100}
                    />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="room"
                render={({ field }) => (
                  <Field className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Room (optional)</Trans>
                    </FieldLabel>
                    <RoomPicker
                      id={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      clearLabel={<Trans>No room</Trans>}
                      onClear={() => field.onChange(null)}
                      className="flex h-9 w-full items-center justify-between rounded-lg border border-input px-3 py-2 text-sm dark:bg-input/30"
                    >
                      {field.value ? (
                        <span className="tabular-nums">
                          {roomLabel(field.value)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          <Trans>Not assigned</Trans>
                        </span>
                      )}
                    </RoomPicker>
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid || claimMutation.isPending}
            >
              {claimMutation.isPending && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Trans>Add</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
