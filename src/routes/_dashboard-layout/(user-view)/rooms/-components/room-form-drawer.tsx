import { zodResolver } from '@hookform/resolvers/zod';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import * as React from 'react';
import {
  Controller,
  type FieldError as FormFieldError,
  useForm
} from 'react-hook-form';
import { createRoomSchema, roomStatusSchema } from 'shared/types/rooms';
import { toast } from 'sonner';
import { z } from 'zod';

import { ApiError } from '@/api/client';
import {
  createRoom,
  invalidateRooms,
  type Room,
  updateRoomById
} from '@/api/rooms';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { RoomStatusLabel } from './room-status';

// The rules are the API's own; the form only wants every field present
const formSchema = createRoomSchema.required();

type FormValues = z.infer<typeof formSchema>;

// The shared schema speaks English; these are what the form shows instead
const requiredMessages = {
  room_number: msg`Room number is required`,
  room_type: msg`Room type is required`
};

const toDefaults = (room?: Room | null): FormValues => ({
  room_number: room?.room_number ?? '',
  name: room?.name ?? '',
  room_type: room?.room_type ?? '',
  floor: room?.floor ?? null,
  status: room?.status ?? 'available'
});

interface RoomFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Edit mode when set; add mode otherwise.
  room?: Room | null;
  /** Types the property already uses, offered as suggestions */
  roomTypes: string[];
}

const optional = (
  <span className="-ml-1 font-normal text-muted-foreground">
    (<Trans>optional</Trans>)
  </span>
);

export function RoomFormDrawer({
  open,
  onOpenChange,
  room,
  roomTypes
}: RoomFormDrawerProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const isEdit = room != null;
  // Reservations find their room by its name
  const isNameLocked = Boolean(room?.has_active_reservation);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toDefaults(room)
  });

  React.useEffect(() => {
    if (open) {
      form.reset(toDefaults(room));
    }
  }, [open, room, form]);

  // A missing required field, in the reader's language; an error the server
  // sent (a taken number) is already worded
  const requiredError = (
    field: keyof typeof requiredMessages,
    error?: FormFieldError
  ) =>
    error && error.type !== 'server'
      ? { ...error, message: t(requiredMessages[field]) }
      : error;

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      room ? updateRoomById(room.id, values) : createRoom(values),
    onSuccess: async () => {
      onOpenChange(false);
      await invalidateRooms(queryClient);
      toast.success(
        isEdit ? t`Room updated successfully` : t`Room created successfully`
      );
    },
    onError: (error) => {
      const code = error instanceof ApiError ? error.code : undefined;
      if (code === 'ROOM_NUMBER_TAKEN') {
        form.setError(
          'room_number',
          {
            type: 'server',
            message: t`A room with this number already exists`
          },
          { shouldFocus: true }
        );
      } else if (code === 'ROOM_HAS_ACTIVE_RESERVATION') {
        form.setError('name', {
          type: 'server',
          message: t`The room has an active reservation and cannot be renamed`
        });
      } else {
        toast.error(isEdit ? t`Error updating room` : t`Error creating room`);
      }
    }
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {isEdit ? <Trans>Edit room</Trans> : <Trans>Add room</Trans>}
          </DrawerTitle>
        </DrawerHeader>
        <form
          noValidate
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DrawerBody>
            <FieldSet className="gap-4">
              <FieldGroup className="gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    control={form.control}
                    name="room_number"
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-2"
                      >
                        <FieldLabel htmlFor="room-number">
                          <Trans>Number</Trans>
                        </FieldLabel>
                        <Input
                          id="room-number"
                          autoFocus
                          placeholder="12A"
                          {...field}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError
                            errors={[
                              requiredError('room_number', fieldState.error)
                            ]}
                          />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="floor"
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-2"
                      >
                        <FieldLabel htmlFor="room-floor">
                          <Trans>Floor</Trans> {optional}
                        </FieldLabel>
                        <NumberInput
                          id="room-floor"
                          name={field.name}
                          value={field.value}
                          step={1}
                          format={{ maximumFractionDigits: 0 }}
                          onValueChange={field.onChange}
                          onBlur={field.onBlur}
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
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="room-name">
                        <Trans>Name</Trans> {optional}
                      </FieldLabel>
                      <Input
                        id="room-name"
                        {...field}
                        disabled={isNameLocked}
                        aria-invalid={fieldState.invalid}
                        aria-describedby="room-name-hint"
                      />
                      <FieldDescription id="room-name-hint">
                        {isNameLocked ? (
                          <Trans>
                            The room has an active reservation, so its name
                            cannot be changed.
                          </Trans>
                        ) : (
                          <Trans>
                            Left empty, the room is named by its number.
                          </Trans>
                        )}
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="room_type"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="room-type">
                        <Trans>Type</Trans>
                      </FieldLabel>
                      {/* A native datalist: pick a type in use or type a new one */}
                      <Input
                        id="room-type"
                        list="room-type-options"
                        autoComplete="off"
                        placeholder={t`e.g. Standard, Suite`}
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      <datalist id="room-type-options">
                        {roomTypes.map((type) => (
                          <option key={type} value={type} />
                        ))}
                      </datalist>
                      {fieldState.invalid && (
                        <FieldError
                          errors={[
                            requiredError('room_type', fieldState.error)
                          ]}
                        />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Field className="gap-2">
                      <FieldLabel htmlFor="room-status">
                        <Trans>Status</Trans>
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="room-status">
                          <SelectValue>
                            {(value: FormValues['status']) => (
                              <RoomStatusLabel status={value} />
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {roomStatusSchema.options.map((status) => (
                            <SelectItem key={status} value={status}>
                              <RoomStatusLabel status={status} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>
          </DrawerBody>

          <DrawerFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              {isEdit ? <Trans>Update</Trans> : <Trans>Add</Trans>}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
