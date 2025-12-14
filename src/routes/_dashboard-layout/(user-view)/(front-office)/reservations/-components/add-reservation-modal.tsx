import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LinkIcon, Loader2Icon, PlusCircleIcon } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { createReservation } from '@/api/reservations';

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
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const addReservationSchema = z.object({
  booking_nr: z.string().min(1, t`Reservation number is required`),
  room: z.string().min(1, t`Room selection is required`),
  page_url: z.url(t`Please enter a valid URL`)
});

type AddReservationFormData = z.infer<typeof addReservationSchema>;

async function createReservationAction(data: AddReservationFormData) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return createReservation(data);
}

export function AddReservationModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<AddReservationFormData>({
    resolver: zodResolver(addReservationSchema),
    defaultValues: {
      booking_nr: '',
      room: '',
      page_url: ''
    }
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  };

  const createReservationMutation = useMutation({
    mutationFn: createReservationAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      handleOpenChange(false);
      toast.success(t`Reservation created successfully`);
    },
    onError: () => {
      toast.error(t`Failed to create reservation`);
    }
  });

  const onSubmit = (data: AddReservationFormData) => {
    createReservationMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button>
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          <Trans>Add Reservation</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Create New Reservation</Trans>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldSet className="gap-6">
            <FieldGroup className="gap-4">
              <Controller
                control={form.control}
                name="booking_nr"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Reservation Nr.</Trans>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder={t`Enter reservation number`}
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
                name="room"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Room</Trans>
                    </FieldLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue>
                          {(value) =>
                            value ? (
                              <span>{value}</span>
                            ) : (
                              <span className="text-muted-foreground">
                                {t`Select a room`}
                              </span>
                            )
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {[101, 102, 103, 104, 105].map((room) => (
                            <SelectItem key={room} value={room.toString()}>
                              <Trans>Room {room}</Trans>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="page_url"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Page URL</Trans>
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <LinkIcon />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        placeholder={t`Enter page URL`}
                        aria-invalid={fieldState.invalid}
                      />
                    </InputGroup>
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
            <Button
              type="submit"
              disabled={createReservationMutation.isPending}
            >
              {createReservationMutation.isPending && (
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
