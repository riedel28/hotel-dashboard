import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';
import { type Control, Controller, useFormState } from 'react-hook-form';

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
import { sectionHeadingId } from './adyen-form-toc';
import {
  ADYEN_PAYMENT_METHODS,
  type AdyenFormData,
  type AdyenMethodId
} from './adyen-form-types';
import { AdyenSectionHeading } from './adyen-section-heading';

interface AdyenMappingCodesSectionProps {
  control: Control<AdyenFormData>;
}

export function AdyenMappingCodesSection({
  control
}: AdyenMappingCodesSectionProps) {
  const { dirtyFields, isDirty } = useFormState({ control });

  return (
    <section
      id="mapping"
      aria-labelledby={sectionHeadingId('mapping')}
      className="grid scroll-mt-4 grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]"
    >
      <AdyenSectionHeading
        id={sectionHeadingId('mapping')}
        title={<Trans>Mapping codes</Trans>}
        description={
          <Trans>
            Accounting codes reported to your PMS per payment method and
            channel.
          </Trans>
        }
      />

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
          {ADYEN_PAYMENT_METHODS.map(({ id, name }) => (
            <TableRow
              key={id}
              className="hover:bg-transparent md:h-12 max-md:grid max-md:grid-cols-2 max-md:gap-x-3 max-md:gap-y-2 max-md:p-4"
            >
              <TableCell className="max-md:col-span-2 max-md:p-0">
                <div className="flex items-center gap-2.5 md:h-8">
                  <BrandMark brand={id} />
                  <span className="text-sm">{name}</span>
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

        {isDirty && (
          <p className="px-4 mt-1.5 text-xs text-muted-foreground flex gap-2 items-center transition-all">
            <span className="size-1.5 rounded-full bg-amber-500 dark:bg-amber-300" />
            <Trans>Unsaved changes</Trans>
          </p>
        )}
      </Table>
    </section>
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
          <InputGroup className="h-9 md:h-7.5 w-full md:w-fit">
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
                <span className="size-1.5 rounded-full bg-amber-500 dark:bg-amber-300" />
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

function BrandMark({ brand }: { brand: AdyenMethodId }) {
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
