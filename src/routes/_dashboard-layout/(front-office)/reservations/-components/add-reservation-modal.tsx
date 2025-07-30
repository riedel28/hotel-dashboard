import React from 'react';

import { buildApiUrl, getEndpointUrl } from '@/config/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { toast } from 'sonner';

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type FormValues = {
  booking_nr: string;
  room: string;
  page_url: string;
};

async function createReservation(data: FormValues) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const response = await fetch(buildApiUrl(getEndpointUrl('reservations')), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: Math.floor(Math.random() * 1000),
      state: 'pending',
      guest_email: 'jd@example.com',
      primary_guest_name: 'John Doe',
      booking_id: Math.floor(Math.random() * 1000),
      completed_at: new Date().toISOString(),
      last_opened_at: new Date().toISOString(),
      received_at: new Date().toISOString(),
      booking_nr: data.booking_nr,
      room_name: data.room,
      page_url: data.page_url,
      balance: Math.floor(Math.random() * 1000)
    })
  });
  if (!response.ok) {
    throw new Error('Failed to create reservation');
  }
  return response.json();
}

export function AddReservationModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const intl = useIntl();

  const form = useForm<FormValues>({
    defaultValues: {
      booking_nr: '',
      room: '',
      page_url: ''
    }
  });

  const createReservationMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      setIsOpen(false);
      form.reset();
      toast.success('Reservation created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create reservation: ' + error.message);
    }
  });

  const onSubmit = (data: FormValues) => {
    createReservationMutation.mutate(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="reservations.add"
            defaultMessage="Add Reservation"
          />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage
              id="reservations.createTitle"
              defaultMessage="Create New Reservation"
            />
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="booking_nr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage
                      id="reservations.reservationNr"
                      defaultMessage="Reservation Nr."
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={intl.formatMessage({
                        id: 'placeholders.reservationNumber',
                        defaultMessage: 'Enter reservation number'
                      })}
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage
                      id="reservations.room"
                      defaultMessage="Room"
                    />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={intl.formatMessage({
                            id: 'placeholders.selectRoom',
                            defaultMessage: 'Select a room'
                          })}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {[101, 102, 103, 104, 105].map((room) => (
                          <SelectItem key={room} value={room.toString()}>
                            <FormattedMessage
                              id="reservations.roomWithNumber"
                              defaultMessage="Room {room}"
                              values={{ room }}
                            />
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="page_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage
                      id="reservations.pageUrl"
                      defaultMessage="Page URL"
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={intl.formatMessage({
                        id: 'placeholders.pageUrl',
                        defaultMessage: 'Enter page URL'
                      })}
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                <FormattedMessage id="actions.cancel" defaultMessage="Cancel" />
              </Button>
              <Button
                type="submit"
                disabled={createReservationMutation.isPending}
              >
                {createReservationMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <FormattedMessage id="actions.create" defaultMessage="Create" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
