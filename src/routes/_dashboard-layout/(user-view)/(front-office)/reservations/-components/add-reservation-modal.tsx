import React from 'react';

import { buildApiUrl, getEndpointUrl } from '@/config/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LinkIcon, Loader2, PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input, InputWrapper } from '@/components/ui/input';
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
      guests: [],
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
  const { t } = useLingui();

  const addReservationSchema = z.object({
    booking_nr: z
      .string()
      .min(1, t({ message: 'Reservation number is required' })),
    room: z.string().min(1, t({ message: 'Room selection is required' })),
    page_url: z.url(t({ message: 'Please enter a valid URL' }))
  });

  const form = useForm<FormValues>({
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
    mutationFn: createReservation,
    onSuccess: () => {
      console.log('Mutation succeeded, about to invalidate queries');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      console.log('Queries invalidated, about to close modal');
      handleOpenChange(false);
      console.log('Modal closed, showing toast');
      toast.success('Reservation created successfully');
      console.log('Success flow completed');
    },
    onError: (error) => {
      console.error('Mutation failed:', error);
      toast.error('Failed to create reservation: ' + error.message);
    }
  });

  const onSubmit = (data: FormValues) => {
    createReservationMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          <Trans>Add Reservation</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Create New Reservation</Trans>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="booking_nr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Reservation Nr.</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t`Enter reservation number`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Room</Trans>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t`Select a room`} />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="page_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Page URL</Trans>
                  </FormLabel>
                  <FormControl>
                    <InputWrapper>
                      <LinkIcon />
                      <Input {...field} placeholder={t`Enter page URL`} />
                    </InputWrapper>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Trans>Create</Trans>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
