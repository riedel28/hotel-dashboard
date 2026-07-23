import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { ArrowUpRightIcon, Loader2Icon } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
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
import { Separator } from '@/components/ui/separator';
import { CredentialsSection } from './credentials-section';
import { MappingCodesSection } from './mapping-codes-section';
import {
  PAYMENT_METHODS,
  type PaymentProviderFormData
} from './payment-provider-form-types';
import {
  PAYMENT_FORM_SECTIONS,
  PaymentProviderTableOfContents
} from './payment-provider-toc';
import { PaymentRecipientSection } from './payment-recipient-section';
import {
  type PaymentTestConnectionConfig,
  PaymentTestConnectionDialog,
  type PaymentTestConnectionResult
} from './payment-test-connection-dialog';

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

  const handleRequestLiveConfirm = (apply: () => void) => {
    confirmLiveRef.current = apply;
    setConfirmLiveOpen(true);
  };

  return (
    <div className="flex flex-row gap-8">
      <PaymentProviderTableOfContents
        sections={PAYMENT_FORM_SECTIONS}
        className="hidden xl:block"
      />

      <Card className="relative min-w-0 flex-1 max-w-4xl overflow-visible">
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
            className="flex flex-col gap-6 md:gap-8"
          >
            <CredentialsSection
              control={form.control}
              onRequestLiveConfirm={handleRequestLiveConfirm}
              onTestConnection={handleTestConnection}
              lastTestResult={lastTestResult}
            />

            <Separator />

            <PaymentRecipientSection control={form.control} />

            <Separator />

            <MappingCodesSection control={form.control} />
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

            <div className="flex gap-2">
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
