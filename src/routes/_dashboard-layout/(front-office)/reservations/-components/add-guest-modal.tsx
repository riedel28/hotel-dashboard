import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { Input } from '@/components/ui/input';

// Zod schema for new guest form
const newGuestSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required')
});

type NewGuestData = z.infer<typeof newGuestSchema>;

interface Guest {
  id: string;
  name: string;
}

interface AddGuestModalProps {
  onAddGuest: (guest: Guest) => void;
}

export function AddGuestModal({ onAddGuest }: AddGuestModalProps) {
  const [open, setOpen] = useState(false);
  const intl = useIntl();

  const form = useForm<NewGuestData>({
    resolver: zodResolver(newGuestSchema),
    defaultValues: {
      firstName: '',
      lastName: ''
    }
  });

  const onSubmit = (data: NewGuestData) => {
    const newGuest: Guest = {
      id: Date.now().toString(), // Simple ID generation for demo
      name: `${data.firstName} ${data.lastName}`
    };

    onAddGuest(newGuest);
    form.reset();
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="reservations.addNewGuest"
            defaultMessage="New Guest"
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage
              id="guests.addNewGuest"
              defaultMessage="Add New Guest"
            />
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage
                      id="guests.firstName"
                      defaultMessage="First Name"
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={intl.formatMessage({
                        id: 'placeholders.enterFirstName',
                        defaultMessage: 'Enter first name'
                      })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage
                      id="guests.lastName"
                      defaultMessage="Last Name"
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={intl.formatMessage({
                        id: 'placeholders.enterLastName',
                        defaultMessage: 'Enter last name'
                      })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                <FormattedMessage id="common.cancel" defaultMessage="Cancel" />
              </Button>
              <Button type="submit">
                <FormattedMessage
                  id="guests.addGuest"
                  defaultMessage="Add Guest"
                />
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
