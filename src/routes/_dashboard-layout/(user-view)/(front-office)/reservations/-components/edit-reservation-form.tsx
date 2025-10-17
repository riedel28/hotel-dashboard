import { useState } from 'react';

import { updateReservationById } from '@/api/reservations';
import { DevTool } from '@hookform/devtools';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Loader2Icon, MoreHorizontal, Trash2, User } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { Guest } from 'shared/types/reservations';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SearchInput } from '@/components/ui/search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { AddGuestModal } from './add-guest-modal';
import { EditGuestModal } from './edit-guest-modal';

export const reservationFormSchema = z.object({
  booking_nr: z.string().min(1, t`Booking number is required`),
  guests: z.array(
    z.object({
      id: z.number(),
      reservation_id: z.number(),
      first_name: z.string().min(1, t`First name is required`),
      last_name: z.string().min(1, t`Last name is required`),
      email: z.string().optional(),
      nationality_code: z.enum(['DE', 'US', 'AT', 'CH']),
      created_at: z.coerce.date(),
      updated_at: z.coerce.date().nullable()
    })
  ),
  adults: z.coerce
    .number()
    .int()
    .min(1, t`At least one adult is required`),
  youth: z.coerce
    .number()
    .int()
    .min(0, t`Youth count cannot be negative`),
  children: z.coerce
    .number()
    .int()
    .min(0, t`Children count cannot be negative`),
  infants: z.coerce
    .number()
    .int()
    .min(0, t`Infants count cannot be negative`),
  purpose: z.enum(['private', 'business']),
  room: z.string().min(1, t`Room selection is required`)
});

type ReservationFormData = z.infer<typeof reservationFormSchema>;

async function updateReservation(id: string, data: ReservationFormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return updateReservationById(id, data);
}

interface EditReservationFormProps {
  reservationId: string;
  reservationData: ReservationFormData;
}

const initialData: ReservationFormData = {
  booking_nr: '',
  guests: [],
  adults: 1,
  youth: 0,
  children: 0,
  infants: 0,
  purpose: 'private',
  room: ''
};

export function EditReservationForm({
  reservationId,
  reservationData
}: EditReservationFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<ReservationFormData>({
    defaultValues: initialData,
    values: reservationData
  });

  const updateReservationMutation = useMutation({
    mutationFn: (data: ReservationFormData) =>
      updateReservation(reservationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reservations', reservationId]
      });
      toast.success(t`Reservation updated successfully`);
    },
    onError: () => {
      toast.error(t`Failed to update reservation. Please try again.`);
    }
  });

  const onSubmit = (data: ReservationFormData) => {
    updateReservationMutation.mutate(data);
  };

  const removeGuest = (guestId: number) => {
    const currentGuests = form.getValues('guests');
    const updatedGuests = currentGuests.filter((guest) => guest.id !== guestId);
    form.setValue('guests', updatedGuests);
  };

  const addGuest = (newGuest: Guest) => {
    const currentGuests = form.getValues('guests');
    const updatedGuests = [...currentGuests, newGuest];
    form.setValue('guests', updatedGuests);
  };

  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const editGuest = (guestId: string, updatedGuest: Guest) => {
    const currentGuests = form.getValues('guests');
    const updatedGuests = currentGuests.map((guest) =>
      guest.id === Number(guestId) ? updatedGuest : guest
    );
    form.setValue('guests', updatedGuests, { shouldValidate: true });
  };

  // Mock room data - replace with actual data from your API
  const roomOptions = [
    {
      id: '401',
      name: 'Standard Room',
      description: 'Comfortable standard room',
      price: 120
    },
    {
      id: '402',
      name: 'Deluxe Room',
      description: 'Spacious deluxe room with premium amenities',
      price: 180
    },
    {
      id: '403',
      name: 'Suite',
      description: 'Luxury suite with separate living area',
      price: 250
    }
  ];

  return (
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-6"
      >
        <Card className="gap-0">
          <CardHeader>
            <CardTitle>
              <Trans>Booking Information</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSet className="gap-4">
              <FieldGroup className="gap-4">
                <Controller
                  control={form.control}
                  name="booking_nr"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Reservation No.</Trans>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        readOnly
                        className="cursor-not-allowed bg-muted"
                        aria-invalid={fieldState.invalid}
                      />
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

        <Card className="gap-0">
          <CardHeader>
            <CardTitle>
              <Trans>Guests</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchInput placeholder={t`Search for a guest...`} />
            <FieldSet className="gap-4">
              <FieldGroup className="gap-4">
                <Controller
                  control={form.control}
                  name="guests"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <div className="space-y-2">
                        {field.value.length === 0 ? (
                          <div className="flex h-10 items-center justify-center text-sm text-muted-foreground">
                            <Trans>No guests added yet</Trans>
                          </div>
                        ) : (
                          field.value.map((guest) => (
                            <div
                              key={guest.id}
                              className="flex items-center justify-between rounded-md border px-2 py-1"
                            >
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="max-w-md truncate text-sm">
                                  {guest.first_name} {guest.last_name}
                                </span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">
                                      <Trans>Open guest menu</Trans>
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-[160px]"
                                >
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      setEditingGuest(guest as Guest)
                                    }
                                  >
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    <Trans>Edit guest</Trans>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => removeGuest(guest.id!)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <Trans>Remove</Trans>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))
                        )}
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>
            <div className="flex justify-end border-t pt-4">
              <AddGuestModal onAddGuest={addGuest} />
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader>
            <CardTitle>
              <Trans>Number of People</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <Controller
                  control={form.control}
                  name="adults"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Adults</Trans>
                      </FieldLabel>
                      <NumberInput
                        {...field}
                        id={field.name}
                        value={field.value}
                        min={1}
                        onValueChange={(value) => field.onChange(value || 0)}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="youth"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Youth</Trans>
                      </FieldLabel>
                      <NumberInput
                        {...field}
                        id={field.name}
                        value={field.value}
                        min={0}
                        onValueChange={(value) => field.onChange(value || 0)}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="children"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Children</Trans>
                      </FieldLabel>
                      <NumberInput
                        {...field}
                        id={field.name}
                        value={field.value}
                        min={0}
                        onValueChange={(value) => field.onChange(value || 0)}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="infants"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Infants</Trans>
                      </FieldLabel>
                      <NumberInput
                        {...field}
                        id={field.name}
                        value={field.value}
                        min={0}
                        onValueChange={(value) => field.onChange(value || 0)}
                      />
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

        <Card className="gap-0">
          <CardHeader>
            <CardTitle>
              <Trans>Purpose of Stay</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup className="gap-4">
                <Controller
                  control={form.control}
                  name="purpose"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel>
                        <Trans>Select purpose</Trans>
                      </FieldLabel>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid gap-2 sm:grid-cols-2"
                      >
                        <Label
                          htmlFor="purpose-private"
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-3 text-left text-sm font-medium transition hover:bg-accent data-[state=checked]:border-primary data-[state=checked]:bg-primary/5"
                        >
                          <RadioGroupItem
                            value="private"
                            id="purpose-private"
                          />
                          <span className="leading-none">
                            <Trans>Private</Trans>
                          </span>
                        </Label>
                        <Label
                          htmlFor="purpose-business"
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-3 text-left text-sm font-medium transition hover:bg-accent data-[state=checked]:border-primary data-[state=checked]:bg-primary/5"
                        >
                          <RadioGroupItem
                            value="business"
                            id="purpose-business"
                          />
                          <span className="leading-none">
                            <Trans>Business</Trans>
                          </span>
                        </Label>
                      </RadioGroup>
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

        <Card className="gap-0">
          <CardHeader>
            <CardTitle>
              <Trans>Room</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup className="gap-4">
                <Controller
                  control={form.control}
                  name="room"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel>
                        <Trans>Select room</Trans>
                      </FieldLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t`Select a room...`}>
                            {roomOptions.find((room) => room.id === field.value)
                              ?.name ?? t`Select a room...`}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {roomOptions.map((room) => (
                            <SelectItem
                              key={room.id}
                              value={room.id}
                              className="flex w-full items-center justify-between rounded-md bg-card p-3 transition-colors hover:bg-accent"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-foreground">
                                  {room.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {room.description}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
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

        <Button type="submit" disabled={updateReservationMutation.isPending}>
          {updateReservationMutation.isPending && (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Trans>Save Changes</Trans>
        </Button>
      </form>

      {editingGuest && (
        <EditGuestModal
          guest={editingGuest}
          onEditGuest={editGuest}
          open={!!editingGuest}
          onOpenChange={(open) => !open && setEditingGuest(null)}
        />
      )}

      {process.env.NODE_ENV === 'development' && (
        <DevTool control={form.control} />
      )}
    </>
  );
}
