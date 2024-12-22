'use client';

import * as React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { Copy, Link, Mail, MessageCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import { Reservation } from './columns';

const messageSchema = z.object({
  first_name: z.string().min(1, {
    message: 'Please enter a first name.'
  }),
  last_name: z.string().min(1, {
    message: 'Please enter a last name.'
  }),
  email: z
    .string()
    .min(1, 'Please enter an email address.')
    .email('Please enter a valid email address, e.g.'),
  prefix: z.string({
    required_error: 'Please select a country code.'
  }),
  phone: z.string().min(1, {
    message: 'Please enter a phone number.'
  }),
  page_url: z.string().optional()
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation;
}

export function ShareDialog({
  open,
  onOpenChange,
  reservation
}: ShareDialogProps) {
  const form = useForm<MessageFormValues>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      prefix: '',
      phone: '',
      page_url: ''
    },
    resolver: zodResolver(messageSchema)
  });

  const emailFormButtonRef = React.useRef<HTMLButtonElement>(null);
  const phoneFormButtonRef = React.useRef<HTMLButtonElement>(null);

  function handleCloseModal(open: boolean) {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }

  function onSubmit(data: MessageFormValues) {
    if (emailFormButtonRef.current) {
      const messageData = {
        type: 'email',
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email
      };
      console.log(messageData);
      toast('Message sent', {
        description: (
          <pre className="w-[320px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              {JSON.stringify(messageData, null, 2)}
            </code>
          </pre>
        )
      });
    } else if (phoneFormButtonRef.current) {
      const messageData = {
        type: 'sms',
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: `+${data.prefix}${data.phone}`
      };
      console.log(messageData);
      toast('Message sent', {
        description: (
          <pre className="w-[320px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              {JSON.stringify(messageData, null, 2)}
            </code>
          </pre>
        )
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send message</DialogTitle>
        </DialogHeader>

        <DialogDescription>
          Send message to the guest via email, SMS or WhatsApp to complete the
          check-in process
        </DialogDescription>

        <div className="mb-2 grid grid-cols-2">
          <div className="flex gap-1">
            <span className="text-muted-foreground">Reservation:</span>
            <span className="font-medium">{reservation.booking_nr}</span>
          </div>

          <div className="flex gap-1">
            <span className="text-muted-foreground">Room:</span>
            <span className="font-medium">{reservation.room_name}</span>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mb-4 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2">
              <div className="mr-2 pt-2">
                <Mail className="size-5 text-muted-foreground/70" />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Last sent:{' '}
                      {dayjs(reservation.last_opened_at).format(
                        'DD.MM.YYYY HH:mm:ss'
                      )}
                    </FormDescription>
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="secondary"
                ref={emailFormButtonRef}
                onClick={() => {
                  form.trigger(['first_name', 'last_name', 'email']);
                }}
              >
                Send
              </Button>
            </div>

            <div className="items-flex-start flex gap-2">
              <div className="mr-2 pt-2">
                <MessageCircle className="size-5 text-muted-foreground/70" />
              </div>

              <FormField
                control={form.control}
                name="prefix"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select defaultValue="49" onValueChange={field.onChange}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="49">🇩🇪 +49</SelectItem>
                          <SelectItem value="43">🇦🇹 +43</SelectItem>
                          <SelectItem value="41">🇨🇭 +41</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="secondary"
                ref={phoneFormButtonRef}
                onClick={() => {
                  form.trigger(['first_name', 'last_name', 'prefix', 'phone']);
                }}
              >
                Send
              </Button>
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              <div className="mr-2">
                <Link className="size-5 text-muted-foreground/70" />
              </div>

              <FormField
                control={form.control}
                name="page_url"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="button" variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleCloseModal(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
