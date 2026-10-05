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
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {isEdit ? <Trans>Edit product</Trans> : <Trans>Add product</Trans>}
          </DrawerTitle>
        </DrawerHeader>
        <form
          onSubmit={form.handleSubmit(onSave)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DrawerBody>
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
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-2"
                      >
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
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-2"
                      >
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
          </DrawerBody>

          <DrawerFooter>
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
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
