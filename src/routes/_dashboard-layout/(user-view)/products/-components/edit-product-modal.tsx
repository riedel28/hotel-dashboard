import { zodResolver } from '@hookform/resolvers/zod';
import { Trans } from '@lingui/react/macro';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

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

interface EditProductModalProps {
  open: boolean;
  initialTitle: string;
  onOpenChange: (open: boolean) => void;
  onSave: (newTitle: string) => void;
}

export function EditProductModal({
  open,
  initialTitle,
  onOpenChange,
  onSave
}: EditProductModalProps) {
  const schema = React.useMemo(
    () => z.object({ title: z.string().trim().min(1, 'Title is required') }),
    []
  );

  const form = useForm<{ title: string }>({
    resolver: zodResolver(schema),
    defaultValues: { title: initialTitle }
  });

  React.useEffect(() => {
    form.reset({ title: initialTitle });
  }, [initialTitle, form]);

  const onSubmit = (values: { title: string }) => {
    onSave(values.title.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Edit product</Trans>
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-2 py-2"
        >
          <FieldSet className="gap-2">
            <FieldGroup className="gap-2">
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
            </FieldGroup>
          </FieldSet>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" disabled={!form.formState.isValid}>
              <Trans>Save</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
