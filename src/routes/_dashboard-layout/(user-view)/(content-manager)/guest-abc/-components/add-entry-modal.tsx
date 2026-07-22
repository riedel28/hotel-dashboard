import { zodResolver } from '@hookform/resolvers/zod';
import { Trans } from '@lingui/react/macro';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type Entry, type EntryFormValues, entrySchema } from './types';

interface AddEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letters: string[];
  onAdd: (letter: string, entry: Entry) => void;
}

export function AddEntryModal({
  open,
  onOpenChange,
  letters,
  onAdd
}: AddEntryModalProps) {
  const defaultValues: EntryFormValues = {
    letter: letters[0] ?? '',
    title: '',
    description: ''
  };

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    mode: 'onChange',
    defaultValues
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
    }
    // Reset should only run when the dialog opens/closes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = (values: EntryFormValues) => {
    onAdd(values.letter, {
      title: values.title.trim(),
      description: values.description.trim()
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Add entry</Trans>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
          <FieldSet className="gap-4">
            <FieldGroup className="gap-4">
              <Controller
                control={form.control}
                name="letter"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Letter</Trans>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        className="w-full uppercase"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {letters.map((l) => (
                          <SelectItem key={l} value={l} className="uppercase">
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Title</Trans>
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
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Description</Trans>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id={field.name}
                      rows={4}
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
