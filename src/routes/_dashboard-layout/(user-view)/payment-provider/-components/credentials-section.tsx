import { t } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { CheckIcon, UnplugIcon, XIcon } from 'lucide-react';
import { type Control, Controller } from 'react-hook-form';

import { Button } from '@/components/ui/button';
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
import { PasswordInput } from '@/components/ui/password-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { PaymentProviderFormData } from './payment-provider-form-types';
import { sectionHeadingId } from './payment-provider-toc';
import type {
  PaymentEnvironment,
  PaymentTestConnectionResult
} from './payment-test-connection-dialog';
import { SectionHeading } from './section-heading';

interface CredentialsSectionProps {
  control: Control<PaymentProviderFormData>;
  /** Called when the user tries to switch to Live; `apply` commits the change. */
  onRequestLiveConfirm: (apply: () => void) => void;
  onTestConnection: () => void;
  lastTestResult: PaymentTestConnectionResult | null;
  disabled?: boolean;
}

export function CredentialsSection({
  control,
  onRequestLiveConfirm,
  onTestConnection,
  lastTestResult,
  disabled = false
}: CredentialsSectionProps) {
  const { i18n } = useLingui();

  return (
    <section
      id="credentials"
      aria-labelledby={sectionHeadingId('credentials')}
      className="grid scroll-mt-4 grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]"
    >
      <SectionHeading
        id={sectionHeadingId('credentials')}
        title={<Trans>Credentials</Trans>}
        description={
          <Trans>Technical connection details for your Adyen account.</Trans>
        }
      />

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
                onValueChange={value => {
                  const next = value as PaymentEnvironment;
                  if (next === 'live' && field.value === 'test') {
                    onRequestLiveConfirm(() => field.onChange('live'));
                    return;
                  }
                  field.onChange(next);
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

        {/* API Key: masked "configured" state with Replace flow */}
        <Controller
          control={control}
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
            onClick={onTestConnection}
            disabled={disabled}
          >
            <UnplugIcon data-icon="inline-start" />
            <Trans>Test connection</Trans>
          </Button>
          {lastTestResult && (
            <p
              className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
              role="status"
              aria-live="polite"
            >
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
                    className="size-[65%]"
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
              <span>
                {lastTestResult.passed ? (
                  <Trans>Connection successful</Trans>
                ) : (
                  <Trans>Connection failed</Trans>
                )}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <Trans>
                  Tested at{' '}
                  {i18n.date(lastTestResult.finishedAt, {
                    timeStyle: 'short'
                  })}
                </Trans>
              </span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
