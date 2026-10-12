import { msg, t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import * as React from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import { FormSection } from '@/components/form-section';
import { SecretField } from '@/components/provider-setup/fields';
import { TestConnection } from '@/components/provider-setup/test-connection';
import type { TestConnectionStep } from '@/components/provider-setup/test-connection-dialog';
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
import { CopyButton } from '@/components/ui/copy-button';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

import type { AdyenFormData } from './adyen-form-types';

const TEST_STEPS: TestConnectionStep[] = [
  {
    id: 'reach',
    name: msg`Reach Adyen API`,
    error: msg`Could not reach the Adyen API — request timed out after 5000 ms.`
  },
  {
    id: 'auth',
    name: msg`Authenticate credentials`,
    error: msg`401 Unauthorized — the API key was rejected.`
  },
  {
    id: 'environment',
    name: msg`Verify environment`,
    error: msg`Environment mismatch — these credentials belong to a different environment.`
  },
  {
    id: 'merchant',
    name: msg`Fetch merchant account`,
    error: msg`Merchant account not found — check the Merchant ID.`
  }
];

interface AdyenCredentialsSectionProps {
  form: UseFormReturn<AdyenFormData>;
  /** A key is already stored: the field then only takes a replacement. */
  apiKeyConfigured?: boolean;
  disabled?: boolean;
}

export function AdyenCredentialsSection({
  form,
  apiKeyConfigured = false,
  disabled = false
}: AdyenCredentialsSectionProps) {
  const { control } = form;
  // The switch to Live waiting to be confirmed, if one is
  const [pendingLive, setPendingLive] = React.useState<(() => void) | null>(
    null
  );

  return (
    <FormSection
      id="credentials"
      title={<Trans>Credentials</Trans>}
      description={
        <Trans>Technical connection details for your Adyen account.</Trans>
      }
    >
      <div className="flex flex-col gap-5">
        <Controller
          control={control}
          name="environment"
          render={({ field }) => (
            <Field>
              <FieldLabel>
                <Trans>Environment</Trans>
              </FieldLabel>
              <RadioGroup
                value={field.value}
                onValueChange={(value) => {
                  if (value === 'live' && field.value === 'test') {
                    setPendingLive(() => () => field.onChange('live'));
                    return;
                  }
                  field.onChange(value);
                }}
                className="grid w-full grid-cols-2 gap-2"
              >
                <Label
                  htmlFor="environment-test"
                  className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted has-[button:disabled]:cursor-not-allowed has-[button:disabled]:opacity-50 dark:bg-input/30"
                >
                  <RadioGroupItem
                    value="test"
                    id="environment-test"
                    disabled={disabled}
                  />
                  <Trans>Test</Trans>
                </Label>
                <Label
                  htmlFor="environment-live"
                  className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted has-[button:disabled]:cursor-not-allowed has-[button:disabled]:opacity-50 dark:bg-input/30"
                >
                  <RadioGroupItem
                    value="live"
                    id="environment-live"
                    disabled={disabled}
                  />
                  <Trans>Live</Trans>
                </Label>
              </RadioGroup>
            </Field>
          )}
        />

        <Controller
          control={control}
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
                aria-describedby={
                  fieldState.invalid ? `${field.name}-error` : undefined
                }
                autoComplete="off"
                spellCheck={false}
                placeholder="merchant-account-name"
              />
              {fieldState.invalid && (
                <FieldError
                  id={`${field.name}-error`}
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />

        <SecretField
          label={<Trans>API Key</Trans>}
          error={form.formState.errors.secret}
          stored={apiKeyConfigured}
          placeholder={t`Enter your API Key`}
          {...form.register('secret')}
        />

        <Controller
          control={control}
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
                  aria-describedby={
                    fieldState.invalid ? `${field.name}-error` : undefined
                  }
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
                <FieldError
                  id={`${field.name}-error`}
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
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
          control={control}
          name="additionalConfig"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                <Trans>Additional configuration</Trans>
                <span className="-ml-1 font-normal text-muted-foreground">
                  (<Trans>optional</Trans>)
                </span>
              </FieldLabel>
              <Textarea
                id={field.name}
                {...field}
                rows={4}
                spellCheck={false}
                className="font-mono text-xs!"
              />
              <FieldDescription className="text-xs">
                <Trans>
                  Optional JSON or certificates passed to the Adyen SDK.
                </Trans>
              </FieldDescription>
            </Field>
          )}
        />

        <TestConnection
          provider="Adyen"
          steps={TEST_STEPS}
          validate={() => form.trigger()}
          disabled={disabled}
        />
      </div>

      <AlertDialog
        open={pendingLive !== null}
        onOpenChange={(open) => {
          if (!open) setPendingLive(null);
        }}
      >
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
                pendingLive?.();
                setPendingLive(null);
              }}
            >
              <Trans>Switch to Live</Trans>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormSection>
  );
}
