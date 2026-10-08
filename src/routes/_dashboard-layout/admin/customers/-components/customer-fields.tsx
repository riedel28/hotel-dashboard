import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  type Control,
  Controller,
  useForm,
  type UseFormReturn
} from 'react-hook-form';
import { z } from 'zod';

import { ApiError } from '@/api/client';
import { CountryPicker } from '@/components/ui/country-picker';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

// Built per render, not at module scope: the messages need the active locale.
function createCustomerFormSchema() {
  const required = z
    .string()
    .trim()
    .min(1, t`This field is required`);
  return z.object({
    first_name: required,
    last_name: required,
    company_name: z.string(),
    email: z
      .string()
      .trim()
      .pipe(z.email(t`Invalid email address`)),
    address_line_1: required,
    address_line_2: z.string(),
    zip: required,
    city: required,
    country_code: required
  });
}

export type CustomerFormValues = z.infer<
  ReturnType<typeof createCustomerFormSchema>
>;

const emptyCustomer: CustomerFormValues = {
  first_name: '',
  last_name: '',
  company_name: '',
  email: '',
  address_line_1: '',
  address_line_2: '',
  zip: '',
  city: '',
  country_code: 'DE'
};

/**
 * The Customer form, shared by the create drawer and the edit page. Pass
 * `values` to keep it in step with a loaded Customer.
 */
export function useCustomerForm(values?: CustomerFormValues) {
  return useForm<CustomerFormValues>({
    resolver: zodResolver(createCustomerFormSchema()),
    defaultValues: emptyCustomer,
    values
  });
}

/**
 * Puts a "this email is taken" rejection on the email field. Returns false
 * for any other error, which the caller reports itself.
 */
export function showEmailTakenError(
  form: UseFormReturn<CustomerFormValues>,
  error: unknown,
  message: string
) {
  if (!(error instanceof ApiError && error.status === 409)) return false;
  form.setError('email', { message }, { shouldFocus: true });
  return true;
}

type TextFieldName = Exclude<keyof CustomerFormValues, 'country_code'>;

function TextField({
  control,
  name,
  label,
  className,
  ...inputProps
}: {
  control: Control<CustomerFormValues>;
  name: TextFieldName;
  label: React.ReactNode;
  className?: string;
} & Pick<React.ComponentProps<'input'>, 'type' | 'autoComplete'>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...field}
            {...inputProps}
            id={field.name}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

function Optional() {
  return (
    <span className="font-normal text-muted-foreground">
      <Trans>(optional)</Trans>
    </span>
  );
}

type FieldsProps = { control: Control<CustomerFormValues> };

/** Who the Customer is: name, company and email. */
export function CustomerContactFields({ control }: FieldsProps) {
  return (
    <FieldGroup className="grid gap-4 sm:grid-cols-2 [&>[data-slot=field]]:gap-2">
      <TextField
        control={control}
        name="first_name"
        label={<Trans>First name</Trans>}
        autoComplete="off"
      />
      <TextField
        control={control}
        name="last_name"
        label={<Trans>Last name</Trans>}
        autoComplete="off"
      />
      <TextField
        control={control}
        name="company_name"
        label={
          <>
            <Trans>Company</Trans> <Optional />
          </>
        }
        className="sm:col-span-2"
        autoComplete="off"
      />
      <TextField
        control={control}
        name="email"
        label={<Trans>Email</Trans>}
        type="email"
        className="sm:col-span-2"
        autoComplete="off"
      />
    </FieldGroup>
  );
}

export function CustomerAddressFields({ control }: FieldsProps) {
  return (
    <FieldGroup className="grid gap-4 sm:grid-cols-3 [&>[data-slot=field]]:gap-2">
      <TextField
        control={control}
        name="address_line_1"
        label={<Trans>Address line 1</Trans>}
        className="sm:col-span-3"
        autoComplete="off"
      />
      <TextField
        control={control}
        name="address_line_2"
        label={
          <>
            <Trans>Address line 2</Trans> <Optional />
          </>
        }
        className="sm:col-span-3"
        autoComplete="off"
      />
      <TextField
        control={control}
        name="zip"
        label={<Trans>ZIP</Trans>}
        autoComplete="off"
      />
      <TextField
        control={control}
        name="city"
        label={<Trans>City</Trans>}
        className="sm:col-span-2"
        autoComplete="off"
      />
      <Controller
        control={control}
        name="country_code"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="sm:col-span-3">
            <FieldLabel id="customer-country-label">
              <Trans>Country</Trans>
            </FieldLabel>
            <CountryPicker
              value={field.value}
              onValueChange={(code) => field.onChange(code ?? '')}
              aria-labelledby="customer-country-label"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}

/** Every field in one column, for the create drawer. */
export function CustomerFields({ control }: FieldsProps) {
  return (
    <div className="space-y-6">
      <CustomerContactFields control={control} />
      <FieldSet className="gap-4">
        <FieldLegend>
          <Trans>Address</Trans>
        </FieldLegend>
        <CustomerAddressFields control={control} />
      </FieldSet>
    </div>
  );
}
