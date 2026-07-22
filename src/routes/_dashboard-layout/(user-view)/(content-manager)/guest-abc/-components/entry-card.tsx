import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2Icon, Loader2Icon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  createGuestAbcEntrySchema,
  updateGuestAbcEntry
} from '@/api/guest-abc';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Item,
  ItemActions,
  ItemDescription,
  ItemHeader,
  ItemTitle
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { DeleteEntryDialog } from './delete-entry-dialog';
import type { Entry, EntryFormValues } from './types';

interface EntryCardProps {
  entry: Entry;
}

export function EntryCard({ entry }: EntryCardProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(createGuestAbcEntrySchema),
    mode: 'onChange',
    defaultValues: {
      title: entry.title,
      description: entry.description
    }
  });

  const updateMutation = useMutation({
    mutationFn: (values: EntryFormValues) =>
      updateGuestAbcEntry(entry.id, values),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['guest-abc'] });
      setIsEditing(false);
      toast.success(
        <p className="font-normal">
          <Trans>
            Entry <span className="font-semibold">{updated.title}</span> was
            updated
          </Trans>
        </p>
      );
    },
    onError: () => {
      toast.error(t`Failed to update entry. Please try again.`);
    }
  });

  const startEditing = () => {
    form.reset({ title: entry.title, description: entry.description });
    setIsEditing(true);
  };

  const onSubmit = (values: EntryFormValues) => {
    updateMutation.mutate(values);
  };

  if (isEditing) {
    // Item's base is `flex flex-wrap`; force nowrap so the column layout
    // doesn't inflate the form's height.
    return (
      <Item
        variant="outline"
        className="flex-col flex-nowrap items-stretch gap-3 p-4"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
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
                      aria-invalid={fieldState.invalid}
                      disabled={updateMutation.isPending}
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
                      disabled={updateMutation.isPending}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={updateMutation.isPending}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="default"
              disabled={updateMutation.isPending || !form.formState.isValid}
            >
              {updateMutation.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              <Trans>Update</Trans>
            </Button>
          </div>
        </form>
      </Item>
    );
  }

  return (
    <>
      <Item
        variant="outline"
        className="flex-col items-stretch gap-1.5 p-4 animate-in fade-in-0 duration-200 motion-reduce:animate-none"
      >
        <ItemHeader>
          <ItemTitle className="text-base">{entry.title}</ItemTitle>
          <ItemActions className="gap-0.5 opacity-0 transition-opacity group-hover/item:opacity-100 focus-within:opacity-100">
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-muted-foreground"
              onClick={startEditing}
            >
              <Edit2Icon className="size-3.5" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => setDeleteOpen(true)}
            >
              <TrashIcon className="size-3.5" />
            </Button>
          </ItemActions>
        </ItemHeader>
        <ItemDescription className="text-[13px]">
          {entry.description}
        </ItemDescription>
      </Item>

      <DeleteEntryDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        entryId={entry.id}
        entryTitle={entry.title}
      />
    </>
  );
}

// Mirrors the read-view EntryCard's exact heights so swapping skeleton →
// content doesn't shift layout: a 28px header row (matching the header, whose
// height comes from the icon action buttons) and two 18.5px description lines.
export function EntryCardSkeleton() {
  return (
    <Item variant="outline" className="flex-col items-stretch gap-1.5 p-4">
      <div className="flex h-7 items-center">
        <Skeleton className="h-4 w-32" />
      </div>
      <div>
        <div className="flex h-[18.5px] items-center">
          <Skeleton className="h-3 w-full" />
        </div>
        <div className="flex h-[18.5px] items-center">
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </Item>
  );
}
