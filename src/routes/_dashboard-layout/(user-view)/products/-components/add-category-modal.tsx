import * as React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Trans } from '@lingui/react/macro';
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
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newTitle: string) => void;
}

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required')
});

export function AddCategoryModal({
  open,
  onOpenChange,
  onSave
}: AddCategoryModalProps) {
  const form = useForm<{ title: string }>({
    resolver: zodResolver(schema),
    defaultValues: { title: '' }
  });

  React.useEffect(() => {
    if (!open) {
      form.reset({ title: '' });
    }
  }, [open, form]);

  const onSubmit = (values: { title: string }) => {
    onSave(values.title.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Add subcategory</Trans>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2 py-2">
          <FieldSet className="gap-2">
            <FieldGroup className="gap-2">
              <Controller
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Category name</Trans>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      autoFocus
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
              <Trans>Add</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
