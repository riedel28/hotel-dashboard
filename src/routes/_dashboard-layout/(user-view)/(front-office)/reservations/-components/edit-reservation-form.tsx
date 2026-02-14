import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Edit2Icon,
  Loader2Icon,
  MoreHorizontalIcon,
  Trash2Icon,
  UserIcon
} from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { Guest, ReservationFormData } from 'shared/types/reservations';
import { toast } from 'sonner';

import { updateReservationById } from '@/api/reservations';
import { roomsQueryOptions } from '@/api/rooms';
import { Button, buttonVariants } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { AddGuestModal } from './add-guest-modal';
import { EditGuestForm } from './edit-guest-form';
import { GuestSearchCombobox } from './guest-search-combobox';

interface EditReservationFormProps {
  reservationId: string;
  reservationData: ReservationFormData;
}

async function updateReservation(id: string, data: ReservationFormData) {
  return updateReservationById(id, data);
}

export function EditReservationForm({
  reservationId,
  reservationData
}: EditReservationFormProps) {
  const queryClient = useQueryClient();
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const form = useForm<ReservationFormData>({
    values: reservationData
  });

  const updateReservationMutation = useMutation({
    mutationFn: (data: ReservationFormData) =>
      updateReservation(reservationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success(t`Reservation updated successfully`);
    },
    onError: (error) => {
      console.error('Failed to update reservation:', error);
      toast.error(t`Failed to update reservation. Please try again.`);
    }
  });

  const handleRemoveGuest = (guestId: number) => {
    const currentGuests = form.getValues('guests');
    form.setValue(
      'guests',
      currentGuests.filter((guest) => guest.id !== guestId)
    );
  };

  const handleEditGuest = (updatedGuest: Guest) => {
    const currentGuests = form.getValues('guests');
    form.setValue(
      'guests',
      currentGuests.map((g) => (g.id === updatedGuest.id ? updatedGuest : g))
    );
    setEditingGuest(null);
  };

  const handleAddGuest = (newGuest: Guest) => {
    const currentGuests = form.getValues('guests');
    form.setValue('guests', [...currentGuests, newGuest]);
  };

  const { data: roomsData } = useQuery(roomsQueryOptions({ per_page: 100 }));
  const rooms = roomsData?.index ?? [];

  const onSubmit = (data: ReservationFormData) => {
    updateReservationMutation.mutate(data);
  };

  return (
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-6"
      >
        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle>
              <Trans>Guests</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <GuestSearchCombobox
              currentGuests={form.watch('guests')}
              onSelectGuest={handleAddGuest}
            />
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
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="max-w-md truncate text-sm">
                                  {guest.first_name} {guest.last_name}
                                </span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  className={cn(
                                    buttonVariants({ variant: 'ghost' }),
                                    'flex h-8 w-8 p-0 data-[state=open]:bg-muted'
                                  )}
                                >
                                  <MoreHorizontalIcon className="h-4 w-4" />
                                  <span className="sr-only">
                                    <Trans>Open guest menu</Trans>
                                  </span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-[180px]"
                                >
                                  <DropdownMenuItem
                                    onClick={() => {
                                      // Delay to allow dropdown to close first
                                      requestAnimationFrame(() => {
                                        setEditingGuest(guest);
                                      });
                                    }}
                                  >
                                    <Edit2Icon className="mr-2 h-4 w-4" />
                                    <Trans>Edit guest</Trans>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => handleRemoveGuest(guest.id)}
                                  >
                                    <Trash2Icon className="mr-2 h-4 w-4" />
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
            <div className="flex justify-end">
              <AddGuestModal onAddGuest={handleAddGuest} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Trans>Number of People</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
                        onValueChange={(value) => field.onChange(value ?? 0)}
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
                        onValueChange={(value) => field.onChange(value ?? 0)}
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
                        onValueChange={(value) => field.onChange(value ?? 0)}
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
                        onValueChange={(value) => field.onChange(value ?? 0)}
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

        <Card>
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

        <Card>
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
                          <SelectValue>
                            {rooms.find(
                              (room) => String(room.id) === field.value
                            )?.name ?? t`Select a room...`}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              <Trans>No rooms available</Trans>
                            </div>
                          ) : (
                            rooms.map((room) => (
                              <SelectItem key={room.id} value={String(room.id)}>
                                {room.name}
                                {room.room_number && (
                                  <span className="text-muted-foreground">
                                    {` (${room.room_number}`}
                                    {room.room_type && ` · ${room.room_type}`}
                                    {')'}
                                  </span>
                                )}
                              </SelectItem>
                            ))
                          )}
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
        <EditGuestForm
          key={editingGuest.id}
          guest={editingGuest}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingGuest(null);
          }}
          onSave={handleEditGuest}
        />
      )}
    </>
  );
}
