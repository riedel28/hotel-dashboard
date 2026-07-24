import { Trans } from '@lingui/react/macro';
import { type Control, Controller } from 'react-hook-form';

import { CountryPicker } from '@/components/ui/country-picker';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { PaymentProviderFormData } from './payment-provider-form-types';
import { sectionHeadingId } from './payment-provider-toc';
import { SectionHeading } from './section-heading';

interface PaymentRecipientSectionProps {
  control: Control<PaymentProviderFormData>;
  disabled?: boolean;
}

export function PaymentRecipientSection({
  control,
  disabled = false
}: PaymentRecipientSectionProps) {
  return (
    <section
      id="recipient"
      aria-labelledby={sectionHeadingId('recipient')}
      className="grid scroll-mt-4 grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]"
    >
      <SectionHeading
        id={sectionHeadingId('recipient')}
        title={<Trans>Payment recipient</Trans>}
        description={
          <Trans>The merchant address shown on payment receipts.</Trans>
        }
      />

      <div className="flex flex-col gap-5">
        <Controller
          control={control}
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
                aria-describedby={
                  fieldState.invalid ? `${field.name}-error` : undefined
                }
                autoComplete="address-line1"
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
          name="addressLine2"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                <Trans>Address line 2</Trans>{' '}
                <span className="-ml-1 font-normal text-muted-foreground">
                  (<Trans>Optional</Trans>)
                </span>
              </FieldLabel>
              <Input id={field.name} {...field} autoComplete="address-line2" />
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[3fr_7fr] lg:grid-cols-[2fr_8fr]">
          <Controller
            control={control}
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
                  aria-describedby={
                    fieldState.invalid ? `${field.name}-error` : undefined
                  }
                  autoComplete="postal-code"
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
                  aria-describedby={
                    fieldState.invalid ? `${field.name}-error` : undefined
                  }
                  autoComplete="address-level2"
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
        </div>

        <Controller
          control={control}
          name="country"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel id={`${field.name}-label`}>
                <Trans>Country</Trans>
              </FieldLabel>
              <CountryPicker
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? '')}
                aria-labelledby={`${field.name}-label`}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid ? `${field.name}-error` : undefined
                }
                disabled={disabled}
                className="bg-background dark:bg-input/30"
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
      </div>
    </section>
  );
}
