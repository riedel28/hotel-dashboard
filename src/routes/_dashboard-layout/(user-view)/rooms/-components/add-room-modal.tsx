import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, PlusCircleIcon } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { createRoom, createRoomSchema } from '@/api/rooms';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
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

const addRoomSchema = createRoomSchema;

type AddRoomFormData = z.infer<typeof addRoomSchema>;

async function createRoomAction(data: AddRoomFormData) {
  return createRoom(data);
}

export function AddRoomModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<AddRoomFormData>({
    resolver: zodResolver(addRoomSchema),
    defaultValues: {
      name: '',
      room_number: '',
      room_type: '',
      status: 'available',
      property_id: ''
    }
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  };

  const createRoomMutation = useMutation({
    mutationFn: createRoomAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      handleOpenChange(false);
      toast.success(t`Room created successfully`);
    },
    onError: () => {
      toast.error(t`Failed to create room`);
    }
  });

  const onSubmit = (data: AddRoomFormData) => {
    createRoomMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            <Trans>Add Room</Trans>
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Create New Room</Trans>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldSet className="gap-6">
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
                      id={field.name}
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder={t`Enter room name`}
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
                      id={field.name}
                      {...field}
                      value={field.value || ''}
                      aria-invalid={fieldState.invalid}
                      placeholder={t`Enter room number`}
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
                      id={field.name}
                      {...field}
                      value={field.value || ''}
                      aria-invalid={fieldState.invalid}
                      placeholder={t`Enter room type (e.g., Standard, Suite)`}
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" disabled={createRoomMutation.isPending}>
              {createRoomMutation.isPending && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Trans>Create</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
