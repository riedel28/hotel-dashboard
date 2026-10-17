import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';
import { type Control, Controller, useFormState } from 'react-hook-form';
import { ADYEN_METHOD_IDS, type AdyenMethodId } from 'shared/types/providers';

import { BRAND_NAMES, BrandMark } from '@/components/brand-mark';
import { FormSection } from '@/components/form-section';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import type { AdyenFormData } from './adyen-form-types';

interface AdyenMappingCodesSectionProps {
  control: Control<AdyenFormData>;
}

export function AdyenMappingCodesSection({
  control
}: AdyenMappingCodesSectionProps) {
  const { dirtyFields, isDirty } = useFormState({ control });

  return (
    <FormSection
      id="mapping"
      title={<Trans>Mapping codes</Trans>}
      description={
        <Trans>
          Accounting codes reported to your PMS per payment method and channel.
        </Trans>
      }
    >
      <div>
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
            {ADYEN_METHOD_IDS.map((id) => (
              <TableRow
                key={id}
                className="hover:bg-transparent max-md:grid max-md:grid-cols-2 max-md:gap-x-3 max-md:gap-y-2 max-md:p-4 md:h-12"
              >
                <TableCell className="max-md:col-span-2 max-md:p-0">
                  <div className="flex items-center gap-2.5 md:h-8">
                    <BrandMark brand={id} />
                    <span className="text-sm">{BRAND_NAMES[id]}</span>
                  </div>
                </TableCell>
                <TableCell className="max-md:p-0">
                  <MappingCell
                    control={control}
                    method={id}
                    kind="ecom"
                    label={<Trans>E-com</Trans>}
                    dirty={Boolean(dirtyFields.mappings?.[id]?.ecom)}
                  />
                </TableCell>
                <TableCell className="max-md:p-0">
                  <MappingCell
                    control={control}
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

        {isDirty && (
          <p className="mt-1.5 flex items-center gap-2 px-4 text-xs text-muted-foreground transition-all">
            <span className="size-1.5 rounded-full bg-warning" />
            <Trans>Unsaved changes</Trans>
          </p>
        )}
      </div>
    </FormSection>
  );
}

function MappingCell({
  control,
  method,
  kind,
  label,
  dirty
}: {
  control: Control<AdyenFormData>;
  method: AdyenMethodId;
  kind: 'ecom' | 'pos';
  label: ReactNode;
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
          <InputGroup className="h-9 w-full md:h-7.5 md:w-fit">
            <InputGroupInput
              id={field.name}
              {...field}
              type="text"
              inputMode="numeric"
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid ? `${field.name}-error` : undefined
              }
              placeholder="0000"
              className={cn('min-w-16 tabular-nums')}
            />
            {dirty && (
              <InputGroupAddon align="inline-end">
                <span className="size-1.5 rounded-full bg-warning" />
              </InputGroupAddon>
            )}
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
  );
}
