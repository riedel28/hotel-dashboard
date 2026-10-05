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
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { cn } from '@/lib/utils';

const formSchema = createProductSchema.omit({ category_id: true });

type FormInput = z.input<typeof formSchema>;
export type ProductFormValues = z.output<typeof formSchema>;

interface ProductFormDrawerProps {
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

export function ProductFormDrawer({
  open,
  onOpenChange,
  product,
  onSave,
  isPending = false
}: ProductFormDrawerProps) {
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
      {/* The app's dialog laid out as a drawer: the form with a rich-text
          description needs more room than a centred modal. */}
      <DialogContent
        // Dimmed but not blurred: the list behind the panel stays readable.
        overlayClassName="supports-backdrop-filter:backdrop-blur-none"
        className={cn(
          'flex max-w-full translate-x-0 translate-y-0 flex-col gap-0 p-0 duration-200 data-open:zoom-in-100 data-closed:zoom-out-100',
          // Phones: a sheet rising from the bottom, as tall as its content
          // up to 90% of the screen.
          'top-auto right-0 bottom-0 left-0 max-h-[90dvh] rounded-t-xl rounded-b-none max-sm:data-open:slide-in-from-bottom max-sm:data-closed:slide-out-to-bottom',
          // From sm up: a full-height panel on the right edge.
          'sm:top-0 sm:left-auto sm:h-dvh sm:max-h-none sm:max-w-xl sm:rounded-none sm:data-open:slide-in-from-right sm:data-closed:slide-out-to-right'
        )}
      >
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>
            {isEdit ? <Trans>Edit product</Trans> : <Trans>Add product</Trans>}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSave)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <FieldSet className="min-h-0 flex-1 gap-4 overflow-y-auto p-5">
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
                    <RichTextEditor
                      id="product-description"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
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
            </FieldGroup>
          </FieldSet>

          <DialogFooter className="border-t px-5 py-4">
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
              {isEdit ? <Trans>Update</Trans> : <Trans>Add</Trans>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
