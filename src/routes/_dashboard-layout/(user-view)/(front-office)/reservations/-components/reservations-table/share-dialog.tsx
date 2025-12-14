'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import dayjs from 'dayjs';
import {
  CheckIcon,
  CopyIcon,
  MailIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  UserIcon
} from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { type Reservation } from '@/api/reservations';
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
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@/components/ui/input-group';
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
import { useCopyToClipboard } from '@/hooks';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation;
}

const messageSchema = z.object({
  first_name: z.string().min(1, {
    message: t`Please enter a first name.`
  }),
  last_name: z.string().min(1, {
    message: t`Please enter a last name.`
  }),
  email: z.email(t`Please enter an email address.`),
  prefix: z.string().min(1, t`Please select a country code.`),
  phone: z.string().min(1, {
    message: t`Please enter a phone number.`
  }),
  page_url: z.url().optional()
});

type MessageFormData = z.infer<typeof messageSchema>;

export function ShareDialog({
  open,
  onOpenChange,
  reservation
}: ShareDialogProps) {
  const [isEmailSending, setIsEmailSending] = React.useState(false);
  const [isSmsSending, setIsSmsSending] = React.useState(false);
  const [isWhatsAppSending, setIsWhatsAppSending] = React.useState(false);
  const { copy, copied } = useCopyToClipboard();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (inputRef.current) {
      copy(inputRef.current.value);
    }
  };

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      prefix: '49',
      phone: '',
      page_url: reservation.page_url || ''
    }
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
      const email = data.email;

      toast.success(<Trans>Email sent successfully</Trans>, {
        description: (
          <div className="mt-2 text-sm">
            <Trans>Check-in email has been sent to {email}</Trans>
          </div>
        )
      });
    } catch {
      toast.error(<Trans>Failed to send email</Trans>);
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
      const prefix = data.prefix;
      const phone = data.phone;

      toast.success(t`SMS sent successfully`, {
        description: t`Check-in SMS has been sent to +${prefix}${phone}`
      });
    } catch {
      toast.error(t`Failed to send SMS`);
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

      const prefix = data.prefix;
      const phone = data.phone;

      toast.success(<Trans>WhatsApp opened</Trans>, {
        description: (
          <div className="mt-2 text-sm">
            <Trans>
              WhatsApp has been opened with your message for +{prefix}
              {phone}
            </Trans>
          </div>
        )
      });
    } catch {
      toast.error(t`Failed to open WhatsApp`);
    } finally {
      setIsWhatsAppSending(false);
    }
  }

  const lastSent = dayjs().format('DD.MM.YYYY HH:mm');

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Send message</Trans>
          </DialogTitle>
          <DialogDescription className="text-sm">
            <Trans>
              Send message to the guest via email, SMS or WhatsApp to complete
              the check-in process
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  <Trans>Reservation</Trans>
                </p>
                <p className="font-medium">{reservation.booking_nr}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  <Trans>Room</Trans>
                </p>
                <p className="font-medium">{reservation.room_name}</p>
              </div>
            </div>
          </div>

          <form className="mt-4 space-y-6">
            {/* Guest Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">
                  <Trans>Guest Information</Trans>
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="first_name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor={field.name}>
                        <Trans>First name</Trans>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder={t`Enter first name`}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="last_name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Last name</Trans>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder={t`Enter last name`}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>

            {/* Email Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-lg bg-blue-100 p-2">
                  <MailIcon className="size-4 text-blue-600" />
                </div>

                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="flex-1 gap-2"
                    >
                      <FieldLabel htmlFor={field.name} className="sr-only">
                        <Trans>Email</Trans>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder={t`guest@example.com`}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
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
                      <Trans>Sending</Trans>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Trans>Send</Trans>
                    </div>
                  )}
                </Button>
              </div>
              <FieldDescription className="ml-8 text-xs">
                <Trans>Last sent: {lastSent}</Trans>
              </FieldDescription>
            </div>

            {/* SMS Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-lg bg-emerald-100 p-2">
                  <MessageCircleIcon className="size-4 text-emerald-600" />
                </div>

                <Controller
                  control={form.control}
                  name="prefix"
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="w-[120px] gap-2"
                    >
                      <FieldLabel id="sms-prefix-label" className="sr-only">
                        <Trans>Country code</Trans>
                      </FieldLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          aria-invalid={fieldState.invalid}
                          aria-labelledby="sms-prefix-label"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="49">
                            <Trans>DE +49</Trans>
                          </SelectItem>
                          <SelectItem value="43">
                            <Trans>AT +43</Trans>
                          </SelectItem>
                          <SelectItem value="41">
                            <Trans>CH +41</Trans>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="flex-1 gap-2"
                    >
                      <FieldLabel
                        id="sms-phone-label"
                        className="sr-only"
                        htmlFor="sms-phone"
                      >
                        <Trans>Phone number</Trans>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="sms-phone"
                        placeholder={t`123 456 789`}
                        aria-invalid={fieldState.invalid}
                        aria-labelledby="sms-phone-label"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
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
                      <Trans>Sending</Trans>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Trans>Send</Trans>
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* WhatsApp Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-lg bg-emerald-100 p-2">
                  <MessageSquareIcon className="size-4 text-emerald-600" />
                </div>

                <Controller
                  control={form.control}
                  name="prefix"
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="w-[120px] gap-2"
                    >
                      <FieldLabel
                        id="whatsapp-prefix-label"
                        className="sr-only"
                      >
                        <Trans>Country code</Trans>
                      </FieldLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          aria-invalid={fieldState.invalid}
                          aria-labelledby="whatsapp-prefix-label"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="49">
                            <Trans>DE +49</Trans>
                          </SelectItem>
                          <SelectItem value="43">
                            <Trans>AT +43</Trans>
                          </SelectItem>
                          <SelectItem value="41">
                            <Trans>CH +41</Trans>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="flex-1 gap-2"
                    >
                      <FieldLabel
                        id="whatsapp-phone-label"
                        className="sr-only"
                        htmlFor="whatsapp-phone"
                      >
                        <Trans>Phone number</Trans>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="whatsapp-phone"
                        placeholder={t`123 456 789`}
                        aria-invalid={fieldState.invalid}
                        aria-labelledby="whatsapp-phone-label"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
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
                      <Trans>Opening</Trans>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Trans>Send</Trans>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Check-in URL Section */}
          <div className="mt-6 space-y-2">
            <InputGroup className="bg-muted">
              <InputGroupInput
                type="text"
                placeholder={t`Check-in URL`}
                defaultValue={reservation.page_url}
                readOnly
                ref={inputRef}
              />
              <InputGroupAddon align="inline-end">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InputGroupButton
                        type="button"
                        onClick={handleCopy}
                        variant="ghost"
                        disabled={copied}
                      >
                        {copied ? (
                          <CheckIcon className="stroke-green-600" size={16} />
                        ) : (
                          <CopyIcon size={16} />
                        )}
                      </InputGroupButton>
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs">
                      <Trans>Copy to clipboard</Trans>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </InputGroupAddon>
            </InputGroup>

            <p className="text-xs text-muted-foreground">
              <Trans>
                Share this URL with guests for direct check-in access
              </Trans>
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
            <Trans>Close</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
