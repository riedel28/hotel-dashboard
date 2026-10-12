import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';
import type {
  ControllerFieldState,
  ControllerRenderProps
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

// The fields a provider form is made of. Each is drawn from what a
// react-hook-form `Controller` hands its `render`, so it can be spread in:
//   render={(props) => <TextField {...props} label={...} />}

interface FieldProps<Value> {
  field: Omit<ControllerRenderProps, 'value'> & { value: Value };
  fieldState: ControllerFieldState;
  label: ReactNode;
  description?: ReactNode;
}

function Error({
  field,
  fieldState
}: Pick<FieldProps<unknown>, 'field' | 'fieldState'>) {
  return fieldState.invalid ? (
    <FieldError id={`${field.name}-error`} errors={[fieldState.error]} />
  ) : null;
}

const invalidProps = ({
  field,
  fieldState
}: Pick<FieldProps<unknown>, 'field' | 'fieldState'>) => ({
  'aria-invalid': fieldState.invalid,
  'aria-describedby': fieldState.invalid ? `${field.name}-error` : undefined
});

export function TextField({
  placeholder,
  ...props
}: FieldProps<string> & { placeholder?: string }) {
  const { field, fieldState, label, description } = props;
  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        {...field}
        {...invalidProps(props)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
      />
      {description && (
        <FieldDescription className="text-xs">{description}</FieldDescription>
      )}
      <Error {...props} />
    </Field>
  );
}

/**
 * A provider's secret. The server never sends it back, so the field starts out
 * empty: once one is stored it only takes a replacement.
 */
export function SecretField({
  configured,
  placeholder,
  ...props
}: FieldProps<string> & {
  /** A secret is already stored. */
  configured: boolean;
  placeholder?: string;
}) {
  const { field, fieldState, label } = props;
  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <PasswordInput
        {...field}
        {...invalidProps(props)}
        id={field.name}
        placeholder={configured ? '••••••••••••' : placeholder}
        autoComplete="off"
        aria-required={!configured}
      />
      {configured && (
        <FieldDescription className="text-xs">
          <Trans>Already stored. Enter a new one only to replace it.</Trans>
        </FieldDescription>
      )}
      <Error {...props} />
    </Field>
  );
}

export function SwitchField({
  field,
  label,
  description
}: Omit<FieldProps<boolean>, 'fieldState'>) {
  return (
    <Field orientation="horizontal" className="justify-between gap-3">
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      <Switch
        id={field.name}
        name={field.name}
        ref={field.ref}
        checked={field.value}
        onCheckedChange={field.onChange}
        onBlur={field.onBlur}
        disabled={field.disabled}
        className="self-start"
      />
    </Field>
  );
}
