import { Suspense } from 'react';

import { buildResourceUrl } from '@/config/api';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  QueryErrorResetBoundary,
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Edit2, MoreHorizontal, Search, Trash2, User } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
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
import { ErrorFallback } from '@/components/ui/error-fallback';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FormSkeleton } from '@/components/ui/form-skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { AddGuestModal } from './-components/add-guest-modal';

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

type ReservationFormData = z.infer<typeof reservationFormSchema>;

async function fetchReservationById(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const response = await fetch(buildResourceUrl('reservations', id));

  if (response.status === 404) {
    throw new Error('Reservation not found');
  }

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();

  return data;
}

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

function ReservationPage() {
  return (
    <div>
      <h1 className="mb-6 text-lg font-semibold md:text-2xl">
        <FormattedMessage
          id="reservations.editTitle"
          defaultMessage="Edit reservation"
        />
      </h1>
      <Suspense fallback={<FormSkeleton />}>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ error, resetErrorBoundary }) => (
                <ErrorFallback
                  error={error}
                  resetErrorBoundary={resetErrorBoundary}
                />
              )}
            >
              <ReservationForm />
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </Suspense>
    </div>
  );
}

function ReservationForm() {
  const { reservationId } = Route.useParams();
  const queryClient = useQueryClient();
  const intl = useIntl();

  const reservationQuery = useSuspenseQuery({
    queryKey: ['reservations', reservationId],
    queryFn: () => fetchReservationById(reservationId)
  });

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
    defaultValues: {
      booking_nr: reservationQuery.data?.booking_nr || '',
      guests: reservationQuery.data?.guests || [
        { id: '1', name: 'Petro Demydov' },
        { id: '2', name: 'Surattana Bopp' }
      ],
      adults: reservationQuery.data?.adults || 2,
      youth: reservationQuery.data?.youth || 0,
      children: reservationQuery.data?.children || 0,
      infants: reservationQuery.data?.infants || 0,
      purpose: reservationQuery.data?.purpose || 'private',
      room: reservationQuery.data?.room || '401'
    }
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
                  <FormLabel className="flex items-center gap-2">
                    <FormattedMessage
                      id="reservations.bookingNumber"
                      defaultMessage="Reservation No."
                    />
                  </FormLabel>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="adults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        <FormattedMessage
                          id="reservations.adults"
                          defaultMessage="Adults"
                        />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
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
                    <FormItem>
                      <FormLabel>
                        <FormattedMessage
                          id="reservations.youth"
                          defaultMessage="Youth"
                        />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
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
                    <FormItem>
                      <FormLabel required>
                        <FormattedMessage
                          id="reservations.children"
                          defaultMessage="Children"
                        />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
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
                    <FormItem>
                      <FormLabel required>
                        <FormattedMessage
                          id="reservations.infants"
                          defaultMessage="Infants"
                        />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
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

export const Route = createFileRoute(
  '/_dashboard-layout/(front-office)/reservations/$reservationId'
)({
  component: ReservationPage
});
