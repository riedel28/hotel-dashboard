import { buildResourceUrl } from '@/config/api';
import { AddGuestModal } from '@/routes/_dashboard-layout/(front-office)/reservations/-components/add-guest-modal';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CircleQuestionMarkIcon,
  Edit2,
  MoreHorizontal,
  Search,
  Trash2,
  User
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

// Zod schema for reservation form
const reservationFormSchema = z.object({
  booking_nr: z.string().min(1, 'Booking number is required'),
  guests: z
    .array(
      z.object({
        id: z.string(),
        name: z.string()
      })
    )
    .min(1, 'At least one guest is required'),
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

  const addGuest = (newGuest: { id: string; name: string }) => {
    const currentGuests = form.getValues('guests');
    const updatedGuests = [...currentGuests, newGuest];
    form.setValue('guests', updatedGuests);
  };

  return (
    <Card className="max-w-2xl shadow-none">
      <CardHeader>
        <CardTitle>
          <FormattedMessage
            id="reservations.formTitle"
            defaultMessage="Reservation Details"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Reservation Number */}
            <FormField
              control={form.control}
              name="booking_nr"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1">
                    <FormLabel className="flex items-center gap-2">
                      <FormattedMessage
                        id="reservations.bookingNumber"
                        defaultMessage="Reservation No."
                      />
                    </FormLabel>
                    <Tooltip>
                      <TooltipTrigger>
                        <CircleQuestionMarkIcon className="text-muted-foreground size-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          <FormattedMessage
                            id="reservations.bookingNumberTooltip"
                            defaultMessage="The booking number can be found in your Property Management System (PMS)"
                          />
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      className="cursor-not-allowed bg-gray-50"
                      aria-describedby="booking-nr-readonly"
                    />
                  </FormControl>
                  <FormDescription id="booking-nr-readonly">
                    <FormattedMessage
                      id="reservations.bookingNumberReadonly"
                      defaultMessage="Booking number cannot be modified"
                    />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Guests Section */}
            <div className="space-y-4">
              <FormLabel>
                <FormattedMessage
                  id="reservations.guests"
                  defaultMessage="Guests"
                />
              </FormLabel>

              {/* Guest Search */}
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder={intl.formatMessage({
                    id: 'placeholders.searchForGuest',
                    defaultMessage: 'Search for a guest...'
                  })}
                  className="pl-10"
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </div>

              {/* Guest List */}
              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-2">
                      {field.value.map((guest) => (
                        <div
                          key={guest.id}
                          className="flex items-center justify-between rounded-md border px-2 py-1"
                        >
                          <div className="flex items-center gap-2">
                            <User className="text-muted-foreground h-4 w-4" />
                            <span className="max-w-md truncate text-sm">
                              {guest.name}
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
                              <DropdownMenuItem>
                                <Edit2 className="mr-2 h-4 w-4" />
                                <FormattedMessage
                                  id="guests.edit"
                                  defaultMessage="Edit guest"
                                />
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
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
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Add New Guest Button */}
              <AddGuestModal onAddGuest={addGuest} />
            </div>

            {/* Number of People */}
            <div className="space-y-4">
              <FormLabel>
                <FormattedMessage
                  id="reservations.numberOfPeople"
                  defaultMessage="Number of People"
                />
              </FormLabel>

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="adults"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel required>
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
                      <FormLabel required>
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
                      <FormLabel required>
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
            </div>

            {/* Purpose of Stay */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel required>
                    <FormattedMessage
                      id="reservations.purposeOfStay"
                      defaultMessage="Purpose of Stay"
                    />
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-y-1"
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

            {/* Room */}
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    <FormattedMessage
                      id="reservations.room"
                      defaultMessage="Room"
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      className="cursor-not-allowed bg-gray-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                disabled={updateReservationMutation.isPending}
              >
                {updateReservationMutation.isPending ? (
                  <FormattedMessage
                    id="common.saving"
                    defaultMessage="Saving..."
                  />
                ) : (
                  <FormattedMessage
                    id="common.save"
                    defaultMessage="Save Changes"
                  />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
