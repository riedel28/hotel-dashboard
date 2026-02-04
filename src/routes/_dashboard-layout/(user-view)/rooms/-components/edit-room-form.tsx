import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { Room } from '@/api/rooms';
import { updateRoomById } from '@/api/rooms';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface EditRoomFormData {
  name: string;
  room_number: string | null;
  room_type: string | null;
  status: Room['status'];
  property_id: string;
}

interface EditRoomFormProps {
  roomId: string;
  roomData: Room;
}

async function updateRoom(id: string, data: EditRoomFormData) {
  return updateRoomById(id, data);
}

export function EditRoomForm({ roomId, roomData }: EditRoomFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<EditRoomFormData>({
    values: {
      name: roomData.name,
      room_number: roomData.room_number || null,
      room_type: roomData.room_type || null,
      status: roomData.status || 'available',
      property_id: roomData.property_id || ''
    }
  });

  const updateRoomMutation = useMutation({
    mutationFn: (data: EditRoomFormData) => updateRoom(roomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId] });
      toast.success(t`Room updated successfully`);
    },
    onError: (error) => {
      console.error('Failed to update room:', error);
      toast.error(t`Failed to update room. Please try again.`);
    }
  });

  const onSubmit = (data: EditRoomFormData) => {
    updateRoomMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans>Room Details</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldSet className="gap-4">
            <FieldGroup className="gap-4">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Room Name</Trans>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder={t`Enter room name`}
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
                name="room_number"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Room Number</Trans>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      value={field.value || ''}
                      placeholder={t`Enter room number`}
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
                name="room_type"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Room Type</Trans>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      value={field.value || ''}
                      placeholder={t`Enter room type (e.g., Standard, Suite)`}
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
                name="status"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Status</Trans>
                    </FieldLabel>
                    <Select
                      value={field.value || 'available'}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue>
                          {(value) =>
                            value ? (
                              <span className="capitalize">{value}</span>
                            ) : (
                              <span className="text-muted-foreground">
                                {t`Select status`}
                              </span>
                            )
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">
                          <Trans>Available</Trans>
                        </SelectItem>
                        <SelectItem value="occupied">
                          <Trans>Occupied</Trans>
                        </SelectItem>
                        <SelectItem value="maintenance">
                          <Trans>Maintenance</Trans>
                        </SelectItem>
                        <SelectItem value="out_of_order">
                          <Trans>Out of Order</Trans>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </Card>

      <Button type="submit" disabled={updateRoomMutation.isPending}>
        {updateRoomMutation.isPending && (
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
        )}
        <Trans>Save Changes</Trans>
      </Button>
    </form>
  );
}
