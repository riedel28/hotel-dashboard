import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
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

import type { Guest } from 'shared/types/reservations';

interface AddGuestModalProps {
  onAddGuest: (guest: Guest) => void;
}

const addGuestSchema = z.object({
  firstName: z.string().min(1, t`First name is required`),
  lastName: z.string().min(1, t`Last name is required`)
});

type AddGuestFormData = z.infer<typeof addGuestSchema>;

export function AddGuestModal({ onAddGuest }: AddGuestModalProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<AddGuestFormData>({
    resolver: zodResolver(addGuestSchema),
    defaultValues: {
      firstName: '',
      lastName: ''
    }
  });

  const onSubmit = (data: AddGuestFormData) => {
    const newGuest: Guest = {
      id: Date.now(),
      reservation_id: 0,
      first_name: data.firstName,
      last_name: data.lastName,
      nationality_code: 'DE',
      created_at: new Date(),
      updated_at: null
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
          <Trans>New Guest</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Trans>Add New Guest</Trans>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>First Name</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t`Enter first name`} />
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
                    <Trans>Last Name</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t`Enter last name`} />
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
                <Trans>Cancel</Trans>
              </Button>
              <Button type="submit">
                <Trans>Add Guest</Trans>
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
