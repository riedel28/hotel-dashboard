import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  createGuestAbcEntry,
  createGuestAbcEntrySchema
} from '@/api/guest-abc';
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
import { Textarea } from '@/components/ui/textarea';

import type { EntryFormValues } from './types';

interface AddEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultValues: EntryFormValues = {
  title: '',
  description: ''
};

export function AddEntryModal({ open, onOpenChange }: AddEntryModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(createGuestAbcEntrySchema),
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

  const addEntryMutation = useMutation({
    mutationFn: (values: EntryFormValues) => createGuestAbcEntry(values),
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ['guest-abc'] });
      onOpenChange(false);
      toast.info(
        <p className="font-normal">
          <Trans>
            Entry <span className="font-semibold">{entry.title}</span> was added
          </Trans>
        </p>
      );
    },
    onError: () => {
      toast.error(t`Failed to add entry. Please try again.`);
    }
  });

  const onSubmit = (values: EntryFormValues) => {
    addEntryMutation.mutate(values);
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
              disabled={addEntryMutation.isPending}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid || addEntryMutation.isPending}
            >
              {addEntryMutation.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              <Trans>Add</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
