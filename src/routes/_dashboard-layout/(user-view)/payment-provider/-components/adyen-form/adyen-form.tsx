import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRightIcon, InfoIcon, Loader2Icon } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import type { PaymentProvider } from 'shared/types/payment-provider';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  paymentProviderQueryOptions,
  savePaymentProvider
} from '@/api/payment-provider';
import { useAuth } from '@/auth';
import { SectionedFormShell } from '@/components/sectioned-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { formatLocalized } from '@/utils/date';

import { AdyenCredentialsSection } from './adyen-credentials-section';
import { ADYEN_FORM_SECTIONS } from './adyen-form-toc';
import { ADYEN_PAYMENT_METHODS, type AdyenFormData } from './adyen-form-types';
import { AdyenMappingCodesSection } from './adyen-mapping-codes-section';
import { AdyenRecipientSection } from './adyen-recipient-section';
import {
  type AdyenTestConnectionConfig,
  AdyenTestConnectionDialog,
  type AdyenTestConnectionResult
} from './adyen-test-connection-dialog';

const EMPTY_VALUES: AdyenFormData = {
  environment: 'test',
  merchantId: '',
  apiKey: '',
  clientKey: '',
  publicKey: '',
  additionalConfig: '',
  addressLine1: '',
  addressLine2: '',
  zip: '',
  city: '',
  country: '',
  mappings: {
    mastercard: { ecom: '', pos: '' },
    visa: { ecom: '', pos: '' },
    amex: { ecom: '', pos: '' },
    paypal: { ecom: '', pos: '' }
  }
};

interface AdyenFormProps {
  /**
   * The stored configuration, or null while Adyen is being set up: the form
   * then asks for the credentials alone.
   */
  saved: PaymentProvider | null;
  /** Opens the provider picker: "Back" during setup, "Change provider" after. */
  onChooseProvider: () => void;
}

export function AdyenForm({ saved, onChooseProvider }: AdyenFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const formId = React.useId();
  const isSetup = saved === null;
  const [confirmLiveOpen, setConfirmLiveOpen] = React.useState(false);
  const [testDialogOpen, setTestDialogOpen] = React.useState(false);
  const [testConfig, setTestConfig] =
    React.useState<AdyenTestConnectionConfig | null>(null);
  const [lastTestResult, setLastTestResult] =
    React.useState<AdyenTestConnectionResult | null>(null);

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
          if (isSetup && !data.apiKey.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: ['apiKey'],
              message: t`API Key is required`
            });
          }
          if (!data.clientKey.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: ['clientKey'],
              message: t`Client Key is required`
            });
          }
          // The recipient is filled in once the provider is connected.
          if (!isSetup) {
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
          }

          for (const { id } of ADYEN_PAYMENT_METHODS) {
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
    [isSetup]
  );

  // Follows the stored configuration: saving it resets the form to it, which
  // also empties the API key field again.
  const values = React.useMemo<AdyenFormData>(
    () => ({ ...EMPTY_VALUES, ...saved?.config }),
    [saved]
  );

  const form = useForm<AdyenFormData>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
    values
  });

  const save = useMutation({
    mutationFn: savePaymentProvider,
    onSuccess: (data) => {
      queryClient.setQueryData(
        paymentProviderQueryOptions(user?.selected_property_id ?? null)
          .queryKey,
        data
      );
    }
  });

  const isSubmitting = save.isPending;
  const isDirty = form.formState.isDirty;
  const environment = form.watch('environment');

  const onSubmit = async ({ apiKey, ...config }: AdyenFormData) => {
    try {
      await save.mutateAsync({ provider: 'adyen', apiKey, config });
      toast.success(isSetup ? t`Adyen connected` : t`Configuration updated`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t`Failed to save configuration`
      );
    }
  };

  const handleTestConnection = async () => {
    if (isSubmitting) return;
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

  const lastUpdated =
    saved &&
    formatLocalized(saved.updated_at, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

  const header = (
    <CardHeader>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center-safe gap-2">
          <CardTitle>
            <Trans>Adyen</Trans>
          </CardTitle>

          <Badge color={environment === 'live' ? 'orange' : 'sky'} size="sm">
            {environment === 'live' ? <Trans>Live</Trans> : <Trans>Test</Trans>}
          </Badge>

          <Badge
            variant="outline"
            size="sm"
            className="cursor-pointer bg-accent text-accent-foreground"
            render={
              <a
                href="https://docs.adyen.com/development-resources/api-credentials/"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <Trans>Integration Guide</Trans>
            <ArrowUpRightIcon aria-hidden="true" />
          </Badge>

          {!isSetup && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={onChooseProvider}
              // Leaving for the picker would drop unsaved changes
              disabled={isDirty || isSubmitting}
            >
              <Trans>Change provider</Trans>
            </Button>
          )}
        </div>
        <div className="flex h-8 w-24 shrink-0 items-center justify-end">
          <img
            src="/adyen-logo.svg"
            alt="Adyen"
            className="max-h-7 max-w-full object-contain"
          />
        </div>
      </div>

      {saved && !saved.config.addressLine1 && (
        <Alert variant="info" role="status" className="mt-2">
          <InfoIcon aria-hidden="true" />
          <AlertDescription>
            <Trans>Add the payment recipient to finish the setup.</Trans>
          </AlertDescription>
        </Alert>
      )}
    </CardHeader>
  );

  const credentials = (
    <AdyenCredentialsSection
      control={form.control}
      apiKeyConfigured={!isSetup}
      onRequestLiveConfirm={handleRequestLiveConfirm}
      onTestConnection={handleTestConnection}
      lastTestResult={lastTestResult}
      disabled={isSubmitting}
    />
  );

  return (
    <>
      {isSetup ? (
        <Card className="max-w-4xl">
          {header}

          <CardContent>
            <form
              id={formId}
              onSubmit={form.handleSubmit(onSubmit)}
              aria-busy={isSubmitting}
              noValidate
            >
              <fieldset disabled={isSubmitting} className="contents">
                {credentials}
              </fieldset>
            </form>
          </CardContent>

          <CardFooter className="justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onChooseProvider}
              disabled={isSubmitting}
            >
              <Trans>Back</Trans>
            </Button>
            <Button type="submit" form={formId} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              )}
              <Trans>Connect provider</Trans>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <SectionedFormShell
          form={form}
          sections={ADYEN_FORM_SECTIONS}
          onSubmit={onSubmit}
          isSaving={isSubmitting}
          submitLabel={<Trans>Save changes</Trans>}
          header={header}
          status={
            isSubmitting ? (
              <Trans>Saving changes…</Trans>
            ) : isDirty ? null : (
              <Trans>Last updated {lastUpdated}</Trans>
            )
          }
        >
          {credentials}

          <Separator />

          <AdyenRecipientSection
            control={form.control}
            disabled={isSubmitting}
          />

          <Separator />

          <AdyenMappingCodesSection control={form.control} />
        </SectionedFormShell>
      )}

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
        <AdyenTestConnectionDialog
          open={testDialogOpen}
          onOpenChange={setTestDialogOpen}
          config={testConfig}
          onFinished={setLastTestResult}
        />
      )}
    </>
  );
}
