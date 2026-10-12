import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';
import {
  type Control,
  type FieldPathByValue,
  type FieldValues,
  type FieldError as FormFieldError,
  useController,
  type UseFormRegisterReturn
} from 'react-hook-form';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Switch } from '@/components/ui/switch';

// The fields a provider form is made of. A text field takes what the form's
// `register` returns, so it is one element in the form:
//   <TextField label={...} error={errors.hotelId} {...form.register('hotelId')} />

interface InputFieldProps extends UseFormRegisterReturn {
  label: ReactNode;
  description?: ReactNode;
  error?: FormFieldError;
  placeholder?: string;
}

/** What marks an input as invalid and ties it to its message. */
const invalidProps = (name: string, error?: FormFieldError) => ({
  'aria-invalid': error !== undefined,
  'aria-describedby': error ? `${name}-error` : undefined
});

function ErrorMessage({
  name,
  error
}: {
  name: string;
  error?: FormFieldError;
}) {
  return error ? <FieldError id={`${name}-error`} errors={[error]} /> : null;
}

export function TextField({
  label,
  description,
  error,
  ...input
}: InputFieldProps) {
  return (
    <Field data-invalid={error !== undefined}>
      <FieldLabel htmlFor={input.name}>{label}</FieldLabel>
      <Input
        id={input.name}
        {...input}
        {...invalidProps(input.name, error)}
        autoComplete="off"
        spellCheck={false}
      />
      {description && (
        <FieldDescription className="text-xs">{description}</FieldDescription>
      )}
      <ErrorMessage name={input.name} error={error} />
    </Field>
  );
}

/**
 * A provider's secret. The server never sends it back, so the field starts out
 * empty: once one is stored it only takes a replacement.
 */
export function SecretField({
  label,
  error,
  stored,
  placeholder,
  ...input
}: Omit<InputFieldProps, 'description'> & {
  /** A secret is already stored. */
  stored: boolean;
}) {
  return (
    <Field data-invalid={error !== undefined}>
      <FieldLabel htmlFor={input.name}>{label}</FieldLabel>
      <PasswordInput
        id={input.name}
        {...input}
        {...invalidProps(input.name, error)}
        placeholder={stored ? '••••••••••••' : placeholder}
        autoComplete="off"
        aria-required={!stored}
      />
      {stored && (
        <FieldDescription className="text-xs">
          <Trans>Already stored. Enter a new one only to replace it.</Trans>
        </FieldDescription>
      )}
      <ErrorMessage name={input.name} error={error} />
    </Field>
  );
}

interface SwitchFieldProps<V extends FieldValues> {
  control: Control<V>;
  name: FieldPathByValue<V, boolean>;
  label: ReactNode;
  description?: ReactNode;
}

export function SwitchField<V extends FieldValues>({
  control,
  name,
  label,
  description
}: SwitchFieldProps<V>) {
  const { field } = useController({ control, name });

  return (
    <Field orientation="horizontal" className="justify-between gap-3">
      <FieldContent>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      <Switch
        id={name}
        name={name}
        ref={field.ref}
        checked={field.value === true}
        onCheckedChange={field.onChange}
        onBlur={field.onBlur}
        disabled={field.disabled}
        className="self-start"
      />
    </Field>
  );
}
