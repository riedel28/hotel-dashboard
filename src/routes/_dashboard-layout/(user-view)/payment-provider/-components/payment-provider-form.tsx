import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  ArrowUpRightIcon,
  CheckIcon,
  Loader2Icon,
  UnplugIcon,
  XIcon
} from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { CountryPicker } from '@/components/ui/country-picker';
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
  InputGroupInput
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  PAYMENT_FORM_SECTIONS,
  PaymentProviderTableOfContents,
  sectionHeadingId
} from './payment-provider-toc';
import {
  type PaymentEnvironment,
  type PaymentTestConnectionConfig,
  PaymentTestConnectionDialog,
  type PaymentTestConnectionResult
} from './payment-test-connection-dialog';

type MethodId = 'mastercard' | 'visa' | 'amex' | 'paypal';

interface MappingCode {
  ecom: string;
  pos: string;
}

interface PaymentProviderFormData {
  environment: PaymentEnvironment;
  merchantId: string;
  apiKey: string;
  clientKey: string;
  publicKey: string;
  additionalConfig: string;
  addressLine1: string;
  addressLine2: string;
  zip: string;
  city: string;
  country: string;
  mappings: Record<MethodId, MappingCode>;
}

const PAYMENT_METHODS: Array<{ id: MethodId; name: string }> = [
  { id: 'mastercard', name: 'MasterCard' },
  { id: 'visa', name: 'Visa' },
  { id: 'amex', name: 'American Express' },
  { id: 'paypal', name: 'PayPal' }
];

const DEFAULT_VALUES: PaymentProviderFormData = {
  environment: 'test',
  merchantId: 'CasablancaHotelECOM',
  apiKey: '',
  clientKey: 'test_ABC123DEF456GHI789JKLMNO',
  publicKey: '10001|A1B2C3D4E5F6A1B2C3D4E5F6',
  additionalConfig:
    '{\n  "allowedOrigins": ["https://booking.casablanca-hotel.com"]\n}',
  addressLine1: '123 Main Street',
  addressLine2: 'Suite 400',
  zip: '1011AA',
  city: 'Amsterdam',
  country: 'NL',
  mappings: {
    mastercard: { ecom: '0024', pos: '0075' },
    visa: { ecom: '0025', pos: '0074' },
    amex: { ecom: '0026', pos: '0076' },
    paypal: { ecom: '0027', pos: '' }
  }
};

export function PaymentProviderForm() {
  const { i18n } = useLingui();

  const [isReplacingApiKey, setIsReplacingApiKey] = React.useState(false);
  const [confirmLiveOpen, setConfirmLiveOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [testDialogOpen, setTestDialogOpen] = React.useState(false);
  const [testConfig, setTestConfig] =
    React.useState<PaymentTestConnectionConfig | null>(null);
  const [lastTestResult, setLastTestResult] =
    React.useState<PaymentTestConnectionResult | null>(null);

  const confirmLiveRef = React.useRef<(() => void) | null>(null);

  const schema = React.useMemo(
    () =>
      z
        .object({
          environment: z.enum(['test', 'live']),
          merchantId: z.string(),
          apiKey: z.string(),
          clientKey: z.string(),
          publicKey: z.string(),
          additionalConfig: z.string(),
          addressLine1: z.string(),
          addressLine2: z.string(),
          zip: z.string(),
          city: z.string(),
          country: z.string(),
          mappings: z.record(
            z.enum(['mastercard', 'visa', 'amex', 'paypal']),
            z.object({ ecom: z.string(), pos: z.string() })
          )
        })
        .superRefine((data, ctx) => {
          if (!data.merchantId.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: ['merchantId'],
              message: t`Merchant ID is required`
            });
          }
          if (isReplacingApiKey && !data.apiKey.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: ['apiKey'],
              message: t`Enter the new API key`
            });
          }
          if (!data.clientKey.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: ['clientKey'],
              message: t`Client Key is required`
            });
          }
          if (!data.addressLine1.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: ['addressLine1'],
              message: t`Address line is required`
            });
          }
          if (!data.zip.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: ['zip'],
              message: t`ZIP / Postal code is required`
            });
          }
          if (!data.city.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: ['city'],
              message: t`City is required`
            });
          }
          if (!data.country.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: ['country'],
              message: t`Country is required`
            });
          }

          for (const { id } of PAYMENT_METHODS) {
            for (const kind of ['ecom', 'pos'] as const) {
              const value = data.mappings[id]?.[kind] ?? '';
              if (value && !/^\d{1,12}$/.test(value)) {
                ctx.addIssue({
                  code: 'custom',
                  path: ['mappings', id, kind],
                  message: t`Digits only (max 12)`
                });
              }
            }
          }
        }),
    [isReplacingApiKey]
  );

  const form = useForm<PaymentProviderFormData>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES
  });

  const { dirtyFields } = form.formState;
  const isDirty = form.formState.isDirty;

  const onSubmit = async (values: PaymentProviderFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsReplacingApiKey(false);
    // Reset to the just-saved values so the form is no longer dirty and any
    // replaced key falls back to the masked "configured" state.
    form.reset({ ...values, apiKey: '' });
    toast.success(t`Config updated`);
  };

  const handleCancel = () => {
    form.reset(DEFAULT_VALUES);
    setIsReplacingApiKey(false);
  };

  const handleTestConnection = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    const values = form.getValues();
    setTestConfig({
      environment: values.environment,
      merchantId: values.merchantId
    });
    setTestDialogOpen(true);
  };

  return (
    <div className="flex flex-row gap-8">
      <PaymentProviderTableOfContents sections={PAYMENT_FORM_SECTIONS} />

      <Card className="relative max-w-4xl overflow-visible">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center-safe gap-2">
                <CardTitle>
                  <Trans>Adyen</Trans>
                </CardTitle>

                <Badge
                  variant="outline"
                  size="sm"
                  className="bg-accent text-accent-foreground text-[11px] rounded-md cursor-pointer"
                  render={
                    <a
                      href="https:google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <Trans>Integration Guide</Trans>
                  <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
                </Badge>
              </div>
            </div>
            <div className="flex h-8 w-24 shrink-0 items-center justify-end">
              <img
                src="/adyen-logo.svg"
                alt="Adyen"
                className="max-h-7 max-w-full object-contain"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form
            id="payment-provider-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8"
          >
            {/* ─── Section 1: Credentials ─────────────────────────────── */}
            <section
              id="credentials"
              aria-labelledby={sectionHeadingId('credentials')}
              className="grid scroll-mt-4 grid-cols-[320px_1fr] gap-4"
            >
              <div>
                <SectionHeading
                  id={sectionHeadingId('credentials')}
                  title={<Trans>Credentials</Trans>}
                  description={
                    <Trans>
                      Technical connection details for your Adyen account.
                    </Trans>
                  }
                />
              </div>

              <div className="flex flex-col gap-5">
                <Controller
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>
                        <Trans>Environment</Trans>
                      </FieldLabel>
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => {
                          const next = value as PaymentEnvironment;
                          if (next === 'live' && field.value === 'test') {
                            confirmLiveRef.current = () =>
                              field.onChange('live');
                            setConfirmLiveOpen(true);
                            return;
                          }
                          field.onChange(next);
                        }}
                        className="grid w-full grid-cols-2 gap-2"
                      >
                        <Label
                          htmlFor="environment-test"
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 h-9 text-sm font-medium transition-colors hover:bg-muted dark:bg-input/30"
                        >
                          <RadioGroupItem value="test" id="environment-test" />
                          <Trans>Test</Trans>
                        </Label>
                        <Label
                          htmlFor="environment-live"
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 h-9 text-sm font-medium transition-colors hover:bg-muted dark:bg-input/30"
                        >
                          <RadioGroupItem value="live" id="environment-live" />
                          <Trans>Live</Trans>
                        </Label>
                      </RadioGroup>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="merchantId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Merchant ID</Trans>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        {...field}
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="merchant-account-name"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* API Key: masked "configured" state with Replace flow */}
                <Controller
                  control={form.control}
                  name="apiKey"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        <Trans>API Key</Trans>
                      </FieldLabel>
                      <PasswordInput
                        {...field}
                        id={field.name}
                        placeholder={t`Enter your API Key`}
                        autoComplete="off"
                        aria-required="true"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={
                          fieldState.invalid ? `${field.name}-error` : undefined
                        }
                      />
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="clientKey"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Client Key</Trans>
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          {...field}
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                          spellCheck={false}
                        />
                        <InputGroupAddon align="inline-end">
                          <CopyButton
                            text={field.value}
                            size="icon-xs"
                            aria-label={t`Copy Client Key`}
                          />
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="publicKey"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Public Key</Trans>
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          {...field}
                          autoComplete="off"
                          spellCheck={false}
                        />
                        <InputGroupAddon align="inline-end">
                          <CopyButton
                            text={field.value}
                            size="icon-xs"
                            aria-label={t`Copy Public Key`}
                          />
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="additionalConfig"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Additional configuration</Trans>
                        <span className="-ml-1 font-normal text-muted-foreground">
                          (<Trans>Optional</Trans>)
                        </span>
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        {...field}
                        rows={4}
                        spellCheck={false}
                        className="font-mono text-xs!"
                      />
                      <FieldDescription>
                        <Trans>
                          Optional JSON or certificates passed to the Adyen SDK.
                        </Trans>
                      </FieldDescription>
                    </Field>
                  )}
                />

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                  >
                    <UnplugIcon data-icon="inline-start" />
                    <Trans>Test connection</Trans>
                  </Button>
                  {lastTestResult && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className={cn(
                          'flex size-3.5 items-center justify-center rounded-full text-white',
                          lastTestResult.passed
                            ? 'bg-emerald-500 dark:bg-emerald-600'
                            : 'bg-red-500 dark:bg-red-600'
                        )}
                      >
                        {lastTestResult.passed ? (
                          <CheckIcon
                            className="size-2.5"
                            strokeWidth={3.5}
                            aria-hidden="true"
                          />
                        ) : (
                          <XIcon
                            className="size-2.5"
                            strokeWidth={3.5}
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <Trans>
                        Tested at{' '}
                        {i18n.date(lastTestResult.finishedAt, {
                          timeStyle: 'short'
                        })}
                      </Trans>
                    </p>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* ─── Section 2: Payment recipient ───────────────────────── */}
            <section
              id="recipient"
              aria-labelledby={sectionHeadingId('recipient')}
              className="grid scroll-mt-4 grid-cols-[320px_1fr] gap-4"
            >
              <div>
                <SectionHeading
                  id={sectionHeadingId('recipient')}
                  title={<Trans>Payment recipient</Trans>}
                  description={
                    <Trans>
                      The merchant address shown on payment receipts.
                    </Trans>
                  }
                />
              </div>

              <div className="flex flex-col gap-5">
                <Controller
                  control={form.control}
                  name="addressLine1"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Address line</Trans>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        {...field}
                        aria-invalid={fieldState.invalid}
                        autoComplete="address-line1"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Address line 2</Trans>{' '}
                        <span className="-ml-1 font-normal text-muted-foreground">
                          (<Trans>Optional</Trans>)
                        </span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        {...field}
                        autoComplete="address-line2"
                      />
                    </Field>
                  )}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_8fr]">
                  <Controller
                    control={form.control}
                    name="zip"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          <Trans>ZIP</Trans>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          {...field}
                          aria-invalid={fieldState.invalid}
                          autoComplete="postal-code"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="city"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          <Trans>City</Trans>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          {...field}
                          aria-invalid={fieldState.invalid}
                          autoComplete="address-level2"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  control={form.control}
                  name="country"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Country</Trans>
                      </FieldLabel>
                      <CountryPicker
                        value={field.value}
                        onValueChange={(value) => field.onChange(value ?? '')}
                        className="bg-background dark:bg-input/30"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </section>

            <Separator />

            {/* ─── Section 3: Mapping codes ───────────────────────────── */}
            <section
              id="mapping"
              aria-labelledby={sectionHeadingId('mapping')}
              className="grid scroll-mt-4 grid-cols-[320px_1fr] gap-4"
            >
              <div>
                <SectionHeading
                  id={sectionHeadingId('mapping')}
                  title={<Trans>Mapping codes</Trans>}
                  description={
                    <Trans>
                      Accounting codes reported to your PMS per payment method
                      and channel.
                    </Trans>
                  }
                />
              </div>

              {/* Real table on desktop; rows collapse to stacked cards on
                mobile via display overrides (single set of inputs, no dupes). */}
              <Table borderless className="max-md:block">
                <TableHeader className="max-md:hidden">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-1/2 text-[13px]">
                      <Trans>Payment method</Trans>
                    </TableHead>
                    <TableHead className="w-1/4 text-[13px]">
                      <Trans>E-com</Trans>
                    </TableHead>
                    <TableHead className="w-1/4 text-[13px]">
                      <Trans>POS</Trans>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="max-md:block">
                  {PAYMENT_METHODS.map(({ id, name }) => (
                    <TableRow
                      key={id}
                      className="hover:bg-transparent h-12 max-md:grid max-md:grid-cols-2 max-md:gap-x-3 max-md:gap-y-2 max-md:p-4"
                    >
                      <TableCell className="max-md:col-span-2 max-md:p-0">
                        <div className="flex items-center gap-2.5 md:h-8">
                          <BrandMark brand={id} />
                          <span className="text-sm">{name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-md:p-0">
                        <MappingCell
                          control={form.control}
                          method={id}
                          kind="ecom"
                          label={<Trans>E-com</Trans>}
                          dirty={Boolean(dirtyFields.mappings?.[id]?.ecom)}
                        />
                      </TableCell>
                      <TableCell className="max-md:p-0">
                        <MappingCell
                          control={form.control}
                          method={id}
                          kind="pos"
                          label={<Trans>POS</Trans>}
                          dirty={Boolean(dirtyFields.mappings?.[id]?.pos)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          </form>
        </CardContent>

        {/* Sticky action bar. The negative bottom offset matches the scroll
          container's bottom padding (main: pb-4 / md:pb-8) so the bar sits
          flush against the very bottom of the viewport, not above the padding. */}
        <CardFooter className="sticky -bottom-4 z-10 -mb-6 rounded-b-xl border-t border-border/60 bg-card/80 py-4! backdrop-blur md:-bottom-8">
          <div className="flex w-full flex-wrap items-center justify-end gap-3">
            <span className="truncate text-xs text-muted-foreground self-center mr-auto">
              Last updated 20.07.2026, 21:49 · John Doe
            </span>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={!isDirty || isSubmitting}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              type="submit"
              form="payment-provider-form"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              <Trans>Update config</Trans>
            </Button>
          </div>
        </CardFooter>

        <AlertDialog open={confirmLiveOpen} onOpenChange={setConfirmLiveOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <Trans>Switch to the Live environment?</Trans>
              </AlertDialogTitle>
              <AlertDialogDescription>
                <Trans>
                  Live mode processes real payments with real cards. Make sure
                  your credentials are production credentials before switching.
                </Trans>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Trans>Cancel</Trans>
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  confirmLiveRef.current?.();
                  confirmLiveRef.current = null;
                  setConfirmLiveOpen(false);
                }}
              >
                <Trans>Switch to Live</Trans>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {testConfig && (
          <PaymentTestConnectionDialog
            open={testDialogOpen}
            onOpenChange={setTestDialogOpen}
            config={testConfig}
            onFinished={setLastTestResult}
          />
        )}
      </Card>
    </div>
  );
}

function SectionHeading({
  id,
  title,
  description
}: {
  id?: string;
  title: React.ReactNode;
  description: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h2 id={id} className="text-[15px] font-medium">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function MappingCell({
  control,
  method,
  kind,
  label,
  dirty
}: {
  control: ReturnType<typeof useForm<PaymentProviderFormData>>['control'];
  method: MethodId;
  kind: 'ecom' | 'pos';
  label: React.ReactNode;
  dirty: boolean;
}) {
  return (
    <Controller
      control={control}
      name={`mappings.${method}.${kind}` as const}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name} className="md:hidden">
            {label}
          </FieldLabel>
          <InputGroup className="w-fit h-7.5">
            <InputGroupInput
              id={field.name}
              {...field}
              type="text"
              inputMode="numeric"
              aria-invalid={fieldState.invalid}
              placeholder="0000"
              className={cn('min-w-12 tabular-nums')}
            />
            {dirty && (
              <InputGroupAddon align="inline-end">
                <span
                  className="size-1.5 rounded-full bg-yellow-500"
                  aria-label={t`Changed`}
                />
              </InputGroupAddon>
            )}
          </InputGroup>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

function BrandMark({ brand }: { brand: MethodId }) {
  const chip =
    'flex h-5 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[5px] border';
  switch (brand) {
    case 'mastercard':
      return (
        <span className={cn(chip, 'border-border bg-white')}>
          <svg viewBox="0 0 32 20" className="h-3.5" aria-hidden="true">
            <circle cx="13" cy="10" r="6" fill="#EB001B" />
            <circle cx="19" cy="10" r="6" fill="#F79E1B" fillOpacity="0.85" />
          </svg>
        </span>
      );
    case 'visa':
      return (
        <span className={cn(chip, 'border-border bg-white')}>
          <span className="text-[10px] font-black italic tracking-tight text-[#1434CB]">
            VISA
          </span>
        </span>
      );
    case 'amex':
      return (
        <span className={cn(chip, 'border-transparent bg-[#016FD0]')}>
          <span className="text-[7px] font-bold uppercase tracking-tight text-white">
            Amex
          </span>
        </span>
      );
    case 'paypal':
      return (
        <span className={cn(chip, 'border-border bg-white')}>
          <span className="text-[8px] font-black italic">
            <span className="text-[#003087]">Pay</span>
            <span className="text-[#0079C1]">Pal</span>
          </span>
        </span>
      );
  }
}
