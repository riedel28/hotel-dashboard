import { useState } from 'react';

import { buildResourceUrl } from '@/config/api';
import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, MoreHorizontal, Trash2, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
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

const reservationFormSchema = z.object({
  booking_nr: z.string().min(1, 'Booking number is required'),
  guests: z.array(
    z.object({
      id: z.string(),
      first_name: z.string(),
      last_name: z.string(),
      nationality_code: z.enum(['DE', 'US', 'AT', 'CH'])
    })
  ),
  adults: z.number().min(1, 'At least one adult is required'),
  youth: z.number().min(0, 'Youth count cannot be negative'),
  children: z.number().min(0, 'Children count cannot be negative'),
  infants: z.number().min(0, 'Infants count cannot be negative'),
  purpose: z.enum(['private', 'business'], {
    required_error: 'Please select a purpose of stay'
  }),
  room: z.string().min(1, 'Room is required')
});

export type ReservationFormData = z.infer<typeof reservationFormSchema>;

export type Guest = {
  id: string;
  first_name: string;
  last_name: string;
  nationality_code: 'DE' | 'US' | 'AT' | 'CH';
};

async function updateReservation(id: string, data: ReservationFormData) {
  const response = await fetch(buildResourceUrl('reservations', id), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to update reservation');
  }

  return response.json();
}

interface EditReservationFormProps {
  reservationId: string;
  initialData: ReservationFormData;
}

export function EditReservationForm({
  reservationId,
  initialData
}: EditReservationFormProps) {
  const queryClient = useQueryClient();
  const intl = useIntl();

  const updateReservationMutation = useMutation({
    mutationFn: (data: ReservationFormData) =>
      updateReservation(reservationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reservations', reservationId]
      });
      toast.success(
        intl.formatMessage({
          id: 'reservations.updateSuccess',
          defaultMessage: 'Reservation updated successfully!'
        })
      );
    },
    onError: () => {
      toast.error(
        intl.formatMessage({
          id: 'reservations.updateError',
          defaultMessage: 'Failed to update reservation. Please try again.'
        })
      );
    }
  });

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: initialData
  });

  const onSubmit = (data: ReservationFormData) => {
    updateReservationMutation.mutate(data);
  };

  const removeGuest = (guestId: string) => {
    const currentGuests = form.getValues('guests');
    const updatedGuests = currentGuests.filter((guest) => guest.id !== guestId);
    form.setValue('guests', updatedGuests);
  };

  const addGuest = (newGuest: Guest) => {
    const currentGuests = form.getValues('guests');
    const updatedGuests = [...currentGuests, newGuest];
    form.setValue('guests', updatedGuests);
  };

  const [editingGuest, setEditingGuest] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    nationality_code: 'DE' | 'US' | 'AT' | 'CH';
  } | null>(null);

  const editGuest = (guestId: string, updatedGuest: Guest) => {
    const currentGuests = form.getValues('guests');
    const updatedGuests = currentGuests.map((guest) =>
      guest.id === guestId ? updatedGuest : guest
    );
    form.setValue('guests', updatedGuests, { shouldValidate: true });
  };

  // Mock room data - replace with actual data from your API
  const roomOptions = [
    {
      id: 'room-1',
      name: 'Standard Room',
      description: 'Comfortable standard room',
      price: 120
    },
    {
      id: 'room-2',
      name: 'Deluxe Room',
      description: 'Spacious deluxe room with premium amenities',
      price: 180
    },
    {
      id: 'room-3',
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
              <FormattedMessage
                id="reservations.bookingInformation"
                defaultMessage="Booking Information"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="booking_nr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FormattedMessage
                      id="reservations.bookingNumber"
                      defaultMessage="Reservation No."
                    />
                  </FormLabel>
                  <FormDescription id="booking-nr-readonly">
                    <FormattedMessage
                      id="reservations.bookingNumberTooltip"
                      defaultMessage="The booking number can be found in your Property Management System (PMS)"
                    />
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
              <FormattedMessage
                id="reservations.guests"
                defaultMessage="Guests"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="space-y-4">
              {/* Guest Search */}
              <SearchInput
                placeholder={intl.formatMessage({
                  id: 'placeholders.searchForGuest',
                  defaultMessage: 'Search for a guest...'
                })}
              />

              {/* Guest List */}
              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-2">
                      {field.value.length === 0 ? (
                        <div className="text-muted-foreground py-4 text-center text-sm">
                          <FormattedMessage
                            id="reservations.noGuestsAdded"
                            defaultMessage="No guests added yet"
                          />
                        </div>
                      ) : (
                        field.value.map((guest) => (
                          <div
                            key={guest.id}
                            className="flex items-center justify-between rounded-md border px-2 py-1"
                          >
                            <div className="flex items-center gap-2">
                              <User className="text-muted-foreground h-4 w-4" />
                              <span className="max-w-md truncate text-sm">
                                <FormattedMessage
                                  id="reservations.guestName"
                                  defaultMessage="{firstName} {lastName}"
                                  values={{
                                    firstName: guest.first_name,
                                    lastName: guest.last_name
                                  }}
                                />
                              </span>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">
                                    <FormattedMessage
                                      id="guests.openMenu"
                                      defaultMessage="Open guest menu"
                                    />
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
                                  <FormattedMessage
                                    id="guests.edit"
                                    defaultMessage="Edit guest"
                                  />
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => removeGuest(guest.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <FormattedMessage
                                    id="guests.remove"
                                    defaultMessage="Remove"
                                  />
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
              <FormattedMessage
                id="reservations.numberOfPeople"
                defaultMessage="Number of People"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="adults"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>
                      <FormattedMessage
                        id="reservations.adults"
                        defaultMessage="Adults"
                      />
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
                      <FormattedMessage
                        id="reservations.youth"
                        defaultMessage="Youth"
                      />
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
                      <FormattedMessage
                        id="reservations.children"
                        defaultMessage="Children"
                      />
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
                      <FormattedMessage
                        id="reservations.infants"
                        defaultMessage="Infants"
                      />
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
              <FormattedMessage
                id="reservations.purposeOfStay"
                defaultMessage="Purpose of Stay"
              />
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
                          <FormattedMessage
                            id="reservations.private"
                            defaultMessage="Private"
                          />
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="business" id="business" />
                        <Label htmlFor="business">
                          <FormattedMessage
                            id="reservations.business"
                            defaultMessage="Business"
                          />
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
              <FormattedMessage id="reservations.room" defaultMessage="Room" />
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
                        <SelectValue
                          placeholder={intl.formatMessage({
                            id: 'placeholders.selectRoom',
                            defaultMessage: 'Select a room...'
                          })}
                        >
                          {roomOptions.find((room) => room.id === field.value)
                            ?.name ??
                            intl.formatMessage({
                              id: 'placeholders.selectRoom',
                              defaultMessage: 'Select a room...'
                            })}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {roomOptions.map((room) => (
                          <SelectItem
                            key={room.id}
                            value={room.id}
                            className="bg-card hover:bg-accent flex w-full items-center justify-between rounded-md p-3 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="text-foreground font-medium">
                                {room.name}
                              </div>
                              <div className="text-muted-foreground text-sm">
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

        <Button type="submit" loading={updateReservationMutation.isPending}>
          <FormattedMessage id="common.save" defaultMessage="Save Changes" />
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
