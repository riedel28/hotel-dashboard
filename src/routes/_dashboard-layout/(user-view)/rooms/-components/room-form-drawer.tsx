import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { roomStatusSchema } from 'shared/types/rooms';
import { toast } from 'sonner';
import { z } from 'zod';

import { ApiError } from '@/api/client';
import { createRoom, type Room, updateRoomById } from '@/api/rooms';
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

import { RoomStatusCell } from './rooms-table/-components/cells/room-status-cell';

// Messages are translated, so the schema is built per render locale
const formSchema = (messages: { number: string; type: string }) =>
  z.object({
    room_number: z.string().trim().min(1, messages.number),
    name: z.string().trim(),
    room_type: z.string().trim().min(1, messages.type),
    floor: z.number().int().nullable(),
    status: roomStatusSchema
  });

type FormValues = z.infer<ReturnType<typeof formSchema>>;

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
    (<Trans>Optional</Trans>)
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
    resolver: zodResolver(
      formSchema({
        number: t`Room number is required`,
        type: t`Room type is required`
      })
    ),
    defaultValues: toDefaults(room)
  });

  React.useEffect(() => {
    if (open) {
      form.reset(toDefaults(room));
    }
  }, [open, room, form]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      room ? updateRoomById(room.id, values) : createRoom(values),
    onSuccess: async () => {
      onOpenChange(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rooms'] }),
        // The room picker lists the rooms too
        queryClient.invalidateQueries({ queryKey: ['devices', 'room-options'] })
      ]);
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
                          <FieldError errors={[fieldState.error]} />
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
                        <FieldError errors={[fieldState.error]} />
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
                              <RoomStatusCell status={value} />
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {roomStatusSchema.options.map((status) => (
                            <SelectItem key={status} value={status}>
                              <RoomStatusCell status={status} />
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
