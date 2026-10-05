import { zodResolver } from '@hookform/resolvers/zod';
import { Trans } from '@lingui/react/macro';
import { Loader2Icon } from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { createProductSchema } from 'shared/types/products';
import { z } from 'zod';

import type { Product } from '@/api/products';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';

const formSchema = createProductSchema.omit({ category_id: true });

type FormInput = z.input<typeof formSchema>;
export type ProductFormValues = z.output<typeof formSchema>;

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Edit mode when set; add mode otherwise.
  product?: Product | null;
  onSave: (values: ProductFormValues) => void;
  isPending?: boolean;
}

// A new product has no default price: it must be typed in (0 is allowed).
function toDefaults(product?: Product | null): Partial<FormInput> {
  return {
    title: product?.title ?? '',
    price: product?.price,
    quantity: product?.quantity ?? 0,
    description: product?.description ?? ''
  };
}

export function ProductFormModal({
  open,
  onOpenChange,
  product,
  onSave,
  isPending = false
}: ProductFormModalProps) {
  const form = useForm<FormInput, unknown, ProductFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: toDefaults(product)
  });

  React.useEffect(() => {
    if (open) {
      form.reset(toDefaults(product));
    }
  }, [open, product, form]);

  const isEdit = product != null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? <Trans>Edit product</Trans> : <Trans>Add product</Trans>}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSave)} className="grid gap-2 py-2">
          <FieldSet className="gap-4">
            <FieldGroup className="gap-4">
              <Controller
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor="product-title">
                      <Trans>Title</Trans>
                    </FieldLabel>
                    <Input
                      id="product-title"
                      autoFocus
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="price"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="product-price">
                        <Trans>Price (€)</Trans>
                      </FieldLabel>
                      <NumberInput
                        id="product-price"
                        name={field.name}
                        value={field.value ?? null}
                        min={0}
                        step={0.5}
                        format={{ maximumFractionDigits: 2 }}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="quantity"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="product-quantity">
                        <Trans>Quantity</Trans>
                      </FieldLabel>
                      <NumberInput
                        id="product-quantity"
                        name={field.name}
                        value={field.value}
                        min={0}
                        onValueChange={(value) => field.onChange(value ?? 0)}
                        onBlur={field.onBlur}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor="product-description">
                      <Trans>Description</Trans>{' '}
                      <span className="-ml-1 font-normal text-muted-foreground">
                        (<Trans>Optional</Trans>)
                      </span>
                    </FieldLabel>
                    <Textarea
                      id="product-description"
                      rows={4}
                      {...field}
                      value={field.value ?? ''}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid || isPending}
            >
              {isPending && <Loader2Icon className="animate-spin" />}
              {isEdit ? <Trans>Save</Trans> : <Trans>Add</Trans>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
