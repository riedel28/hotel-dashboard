import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FormattedMessage, IntlShape, useIntl } from 'react-intl';
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

import type { Guest } from './edit-reservation-form';

export const createEditGuestSchema = (intl: IntlShape) =>
  z.object({
    firstName: z.string().min(
      1,
      intl.formatMessage({
        id: 'validation.firstName.required',
        defaultMessage: 'First name is required'
      })
    ),
    lastName: z.string().min(
      1,
      intl.formatMessage({
        id: 'validation.lastName.required',
        defaultMessage: 'Last name is required'
      })
    )
  });

type EditGuestData = z.infer<ReturnType<typeof createEditGuestSchema>>;

interface EditGuestModalProps {
  guest: Guest;
  onEditGuest: (guestId: string, updatedGuest: Guest) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditGuestModal({
  guest,
  onEditGuest,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: EditGuestModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const intl = useIntl();

  const firstName = guest.first_name;
  const lastName = guest.last_name;

  const form = useForm<EditGuestData>({
    resolver: zodResolver(createEditGuestSchema(intl)),
    defaultValues: {
      firstName,
      lastName
    }
  });

  const onSubmit = (data: EditGuestData) => {
    const updatedGuest: Guest = {
      id: guest.id,
      first_name: data.firstName,
      last_name: data.lastName,
      nationality_code: 'DE'
    };

    onEditGuest(guest.id, updatedGuest);
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
            <FormattedMessage
              id="guests.editGuest"
              defaultMessage="Edit Guest"
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
                  id="guests.saveChanges"
                  defaultMessage="Save Changes"
                />
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
