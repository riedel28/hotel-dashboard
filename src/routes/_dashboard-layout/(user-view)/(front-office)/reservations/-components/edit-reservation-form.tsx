import { useState } from 'react';

import {
  reservationSchema as apiReservationSchema,
  guestSchema,
  updateReservationById
} from '@/api/reservations';
import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Loader2Icon, MoreHorizontal, Trash2, User } from 'lucide-react';
import { type Resolver, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
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

export type Guest = {
  id: string;
  first_name: string;
  last_name: string;
  nationality_code: 'DE' | 'US' | 'AT' | 'CH';
};

export const reservationFormSchema = z.object({
  booking_nr: apiReservationSchema.shape.booking_nr.min(
    1,
    t`Booking number is required`
  ),
  guests: z.array(
    guestSchema.extend({
      first_name: guestSchema.shape.first_name.min(
        1,
        t`First name is required`
      ),
      last_name: guestSchema.shape.last_name.min(1, t`Last name is required`)
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

export const guestsFormSchema = reservationFormSchema.shape.guests;

type ReservationFormData = z.infer<typeof reservationFormSchema>;
type GuestsFormData = z.infer<typeof guestsFormSchema>;

async function updateReservation(id: string, data: ReservationFormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return updateReservationById(id, data);
}

interface EditReservationFormProps {
  reservationId: string;
  reservationData: ReservationFormData;
}

const initialData = {
  booking_nr: '',
  guests: [] as GuestsFormData,
  adults: 1,
  youth: 0,
  children: 0,
  infants: 0,
  purpose: 'private' as const,
  room: ''
};

export function EditReservationForm({
  reservationId,
  reservationData
}: EditReservationFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(
      reservationFormSchema
    ) as unknown as Resolver<ReservationFormData>,
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

  const onSubmit: SubmitHandler<ReservationFormData> = (data) => {
    updateReservationMutation.mutate({ ...reservationData, ...data });
  };

  const removeGuest = (guestId: string) => {
    const currentGuests = form.getValues('guests') as GuestsFormData;
    const updatedGuests = currentGuests.filter((guest) => guest.id !== guestId);
    form.setValue('guests', updatedGuests);
  };

  const addGuest = (newGuest: Guest) => {
    const currentGuests = form.getValues('guests');
    const updatedGuests = [...currentGuests, newGuest];
    form.setValue('guests', updatedGuests);
  };

  const [editingGuest, setEditingGuest] = useState<
    GuestsFormData[number] | null
  >(null);

  const editGuest = (guestId: string, updatedGuest: Guest) => {
    const currentGuests = form.getValues('guests') as GuestsFormData;
    const updatedGuests = currentGuests.map((guest) =>
      guest.id === guestId ? updatedGuest : guest
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-3"
      >
        {/* Reservation Number Section */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>
              <Trans>Booking Information</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="booking_nr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Trans>Reservation No.</Trans>
                  </FormLabel>
                  <FormDescription id="booking-nr-readonly">
                    <Trans>
                      The booking number can be found in your Property
                      Management System (PMS)
                    </Trans>
                  </FormDescription>

                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      className="cursor-not-allowed bg-gray-50"
                      aria-describedby="booking-nr-readonly"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Guests Section */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>
              <Trans>Guests</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="space-y-4">
              {/* Guest Search */}
              <SearchInput placeholder={t`Search for a guest...`} />

              {/* Guest List */}
              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-2">
                      {field.value.length === 0 ? (
                        <div className="flex h-[42px] w-full items-center justify-center text-center text-sm text-muted-foreground">
                          <Trans>No guests added yet</Trans>
                        </div>
                      ) : (
                        (field.value as GuestsFormData).map((guest) => (
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
                                  onSelect={() => setEditingGuest(guest)}
                                >
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  <Trans>Edit guest</Trans>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => removeGuest(guest.id)}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t-0">
            <AddGuestModal onAddGuest={addGuest} />
          </CardFooter>
        </Card>

        {/* Number of People Section */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>
              <Trans>Number of People</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="adults"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>
                      <Trans>Adults</Trans>
                    </FormLabel>
                    <FormControl>
                      <NumberInput
                        {...field}
                        min={1}
                        onValueChange={(value) => field.onChange(value || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="youth"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>
                      <Trans>Youth</Trans>
                    </FormLabel>
                    <FormControl>
                      <NumberInput
                        {...field}
                        min={0}
                        onValueChange={(value) => field.onChange(value || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="children"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>
                      <Trans>Children</Trans>
                    </FormLabel>
                    <FormControl>
                      <NumberInput
                        {...field}
                        min={0}
                        onValueChange={(value) => field.onChange(value || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="infants"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>
                      <Trans>Infants</Trans>
                    </FormLabel>
                    <FormControl>
                      <NumberInput
                        {...field}
                        min={0}
                        onValueChange={(value) => field.onChange(value || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Purpose of Stay Section */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>
              <Trans>Purpose of Stay</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private">
                          <Trans>Private</Trans>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="business" id="business" />
                        <Label htmlFor="business">
                          <Trans>Business</Trans>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Room Section */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>
              <Trans>Room</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

      {/* React Hook Form DevTools - only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <DevTool control={form.control} />
      )}
    </Form>
  );
}
