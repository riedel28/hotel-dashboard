'use client';

import * as React from 'react';

import { useCopyToClipboard } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { CheckIcon, CopyIcon, Mail, MessageCircle, User } from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
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
import { Input, InputWrapper } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

import { Reservation } from './reservations-table';

const messageSchema = z.object({
  first_name: z.string().min(1, {
    message: 'Please enter a first name.'
  }),
  last_name: z.string().min(1, {
    message: 'Please enter a last name.'
  }),
  email: z.email('Please enter an email address.'),
  prefix: z.string().min(1, 'Please select a country code.'),
  phone: z.string().min(1, {
    message: 'Please enter a phone number.'
  }),
  page_url: z.url().optional()
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
  const [isEmailSending, setIsEmailSending] = React.useState(false);
  const [isSmsSending, setIsSmsSending] = React.useState(false);
  const [isWhatsAppSending, setIsWhatsAppSending] = React.useState(false);
  const { copy, copied } = useCopyToClipboard();
  const intl = useIntl();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (inputRef.current) {
      copy(inputRef.current.value);
    }
  };

  const form = useForm<MessageFormValues>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      prefix: '49',
      phone: '',
      page_url: reservation.page_url || ''
    },
    resolver: zodResolver(messageSchema)
  });

  const emailFormButtonRef = React.useRef<HTMLButtonElement>(null);
  const phoneFormButtonRef = React.useRef<HTMLButtonElement>(null);

  function handleCloseModal(open: boolean) {
    if (!open) {
      form.reset();
      setIsEmailSending(false);
      setIsSmsSending(false);
      setIsWhatsAppSending(false);
    }
    onOpenChange(open);
  }

  async function handleEmailSend() {
    const isValid = await form.trigger(['first_name', 'last_name', 'email']);
    if (!isValid) return;

    setIsEmailSending(true);
    try {
      const data = form.getValues();
      const messageData = {
        type: 'email',
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(messageData);
      toast.success(
        <FormattedMessage
          id="reservations.emailSent"
          defaultMessage="Email sent successfully"
        />,
        {
          description: (
            <div className="mt-2 text-sm">
              <FormattedMessage
                id="reservations.emailSentDesc"
                defaultMessage="Check-in email has been sent to {email}"
                values={{ email: data.email }}
              />
            </div>
          )
        }
      );
    } catch {
      toast.error(
        <FormattedMessage
          id="reservations.emailError"
          defaultMessage="Failed to send email"
        />
      );
    } finally {
      setIsEmailSending(false);
    }
  }

  async function handleSmsSend() {
    const isValid = await form.trigger([
      'first_name',
      'last_name',
      'prefix',
      'phone'
    ]);
    if (!isValid) return;

    setIsSmsSending(true);
    try {
      const data = form.getValues();
      const messageData = {
        type: 'sms',
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: `+${data.prefix}${data.phone}`
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(messageData);
      toast.success(
        intl.formatMessage({
          id: 'reservations.smsSent',
          defaultMessage: 'SMS sent successfully'
        }),
        {
          description: intl.formatMessage({
            id: 'reservations.smsSentDesc',
            defaultMessage: 'Check-in SMS has been sent to +{prefix}{phone}'
          })
        }
      );
    } catch {
      toast.error(
        intl.formatMessage({
          id: 'reservations.smsError',
          defaultMessage: 'Failed to send SMS'
        })
      );
    } finally {
      setIsSmsSending(false);
    }
  }

  async function handleWhatsAppSend() {
    const isValid = await form.trigger([
      'first_name',
      'last_name',
      'prefix',
      'phone'
    ]);
    if (!isValid) return;

    setIsWhatsAppSending(true);
    try {
      const data = form.getValues();
      const phoneNumber = `+${data.prefix}${data.phone}`;
      const message = `Hello ${data.first_name} ${data.last_name}, here's your check-in link: ${reservation.page_url}`;

      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');

      toast.success(
        <FormattedMessage
          id="reservations.whatsappOpened"
          defaultMessage="WhatsApp opened"
        />,
        {
          description: (
            <div className="mt-2 text-sm">
              <FormattedMessage
                id="reservations.whatsappOpenedDesc"
                defaultMessage="WhatsApp has been opened with your message for +{prefix}{phone}"
                values={{ prefix: data.prefix, phone: data.phone }}
              />
            </div>
          )
        }
      );
    } catch {
      toast.error(
        intl.formatMessage({
          id: 'reservations.whatsappError',
          defaultMessage: 'Failed to open WhatsApp'
        })
      );
    } finally {
      setIsWhatsAppSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage
              id="reservations.sendMessage"
              defaultMessage="Send message"
            />
          </DialogTitle>
          <DialogDescription className="text-sm">
            <FormattedMessage
              id="reservations.sendMessageDesc"
              defaultMessage="Send message to the guest via email, SMS or WhatsApp to complete the check-in process"
            />
          </DialogDescription>
        </DialogHeader>

        <ScrollArea>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-muted-foreground text-xs">
                  <FormattedMessage
                    id="reservations.reservationNr"
                    defaultMessage="Reservation"
                  />
                </p>
                <p className="font-medium">{reservation.booking_nr}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-muted-foreground text-xs">
                  <FormattedMessage
                    id="reservations.room"
                    defaultMessage="Room"
                  />
                </p>
                <p className="font-medium">{reservation.room_name}</p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form className="mt-4 space-y-6">
              {/* Guest Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="text-muted-foreground h-4 w-4" />
                  <h3 className="text-sm font-medium">
                    <FormattedMessage
                      id="reservations.guestInformation"
                      defaultMessage="Guest Information"
                    />
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <FormattedMessage
                            id="reservations.firstName"
                            defaultMessage="First name"
                          />
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={intl.formatMessage({
                              id: 'placeholders.firstName',
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
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <FormattedMessage
                            id="reservations.lastName"
                            defaultMessage="Last name"
                          />
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={intl.formatMessage({
                              id: 'placeholders.lastName',
                              defaultMessage: 'Enter last name'
                            })}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Email Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-lg bg-blue-100 p-2">
                    <Mail className="size-4 text-blue-600" />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <>
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={intl.formatMessage({
                                id: 'placeholders.email',
                                defaultMessage: 'guest@example.com'
                              })}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </>
                    )}
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    ref={emailFormButtonRef}
                    onClick={handleEmailSend}
                    disabled={isEmailSending}
                  >
                    {isEmailSending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <FormattedMessage
                          id="actions.sending"
                          defaultMessage="Sending"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FormattedMessage
                          id="actions.send"
                          defaultMessage="Send"
                        />
                      </div>
                    )}
                  </Button>
                </div>
                <FormDescription className="ml-8 text-xs">
                  <FormattedMessage
                    id="reservations.lastSent"
                    defaultMessage="Last sent: {date}"
                    values={{
                      date: dayjs().format('DD.MM.YYYY HH:mm')
                    }}
                  />
                </FormDescription>
              </div>

              {/* SMS Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-lg bg-emerald-100 p-2">
                    <MessageCircle className="size-4 text-emerald-600" />
                  </div>

                  <FormField
                    control={form.control}
                    name="prefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            defaultValue="49"
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="49">
                                <FormattedMessage
                                  id="phoneCodes.germany"
                                  defaultMessage="DE +49"
                                />
                              </SelectItem>
                              <SelectItem value="43">
                                <FormattedMessage
                                  id="phoneCodes.austria"
                                  defaultMessage="AT +43"
                                />
                              </SelectItem>
                              <SelectItem value="41">
                                <FormattedMessage
                                  id="phoneCodes.switzerland"
                                  defaultMessage="CH +41"
                                />
                              </SelectItem>
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
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={intl.formatMessage({
                              id: 'placeholders.phone',
                              defaultMessage: '123 456 789'
                            })}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    ref={phoneFormButtonRef}
                    onClick={handleSmsSend}
                    disabled={isSmsSending}
                  >
                    {isSmsSending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <FormattedMessage
                          id="actions.sending"
                          defaultMessage="Sending"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FormattedMessage
                          id="actions.send"
                          defaultMessage="Send"
                        />
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {/* WhatsApp Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-lg bg-emerald-100 p-2">
                    <MessageSquare className="size-4 text-emerald-600" />
                  </div>

                  <FormField
                    control={form.control}
                    name="prefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            defaultValue="49"
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="49">
                                <FormattedMessage
                                  id="phoneCodes.germany"
                                  defaultMessage="DE +49"
                                />
                              </SelectItem>
                              <SelectItem value="43">
                                <FormattedMessage
                                  id="phoneCodes.austria"
                                  defaultMessage="AT +43"
                                />
                              </SelectItem>
                              <SelectItem value="41">
                                <FormattedMessage
                                  id="phoneCodes.switzerland"
                                  defaultMessage="CH +41"
                                />
                              </SelectItem>
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
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={intl.formatMessage({
                              id: 'placeholders.phone',
                              defaultMessage: '123 456 789'
                            })}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleWhatsAppSend}
                    disabled={isWhatsAppSending}
                  >
                    {isWhatsAppSending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <FormattedMessage
                          id="actions.opening"
                          defaultMessage="Opening"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FormattedMessage
                          id="actions.send"
                          defaultMessage="Send"
                        />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>

          {/* Check-in URL Section */}
          <div className="mt-6 space-y-2">
            <InputWrapper className="bg-muted">
              <Input
                type="text"
                placeholder={intl.formatMessage({
                  id: 'placeholders.checkinUrl',
                  defaultMessage: 'Check-in URL'
                })}
                defaultValue={reservation.page_url}
                readOnly
                ref={inputRef}
              />
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      onClick={handleCopy}
                      variant="dim"
                      disabled={copied}
                      className="-me-3.5"
                    >
                      {copied ? (
                        <CheckIcon className="stroke-green-600" size={16} />
                      ) : (
                        <CopyIcon size={16} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    <FormattedMessage
                      id="actions.copy"
                      defaultMessage="Copy to clipboard"
                    />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </InputWrapper>

            <p className="text-muted-foreground text-xs">
              <FormattedMessage
                id="reservations.urlDescription"
                defaultMessage="Share this URL with guests for direct check-in access"
              />
            </p>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleCloseModal(false)}
            className="flex-1 sm:flex-none"
          >
            <FormattedMessage id="actions.close" defaultMessage="Close" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
