import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
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

interface EditGuestModalProps {
  guest: Guest;
  onEditGuest: (guestId: string, updatedGuest: Guest) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const editGuestSchema = z.object({
  firstName: z.string().min(1, t`First name is required`),
  lastName: z.string().min(1, t`Last name is required`)
});

type EditGuestFormData = z.infer<typeof editGuestSchema>;

export function EditGuestModal({
  guest,
  onEditGuest,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: EditGuestModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const firstName = guest.first_name;
  const lastName = guest.last_name;

  const form = useForm<EditGuestFormData>({
    resolver: zodResolver(editGuestSchema),
    defaultValues: {
      firstName,
      lastName
    }
  });

  const onSubmit = (data: EditGuestFormData) => {
    const updatedGuest: Guest = {
      id: guest.id,
      reservation_id: guest.reservation_id,
      first_name: data.firstName,
      last_name: data.lastName,
      email: guest.email,
      nationality_code: guest.nationality_code,
      created_at: guest.created_at,
      updated_at: new Date()
    };

    onEditGuest(guest.id.toString(), updatedGuest);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form to original values when closing
      form.reset({
        firstName,
        lastName
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Trans>Edit Guest</Trans>
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
                <Trans>Save Changes</Trans>
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
