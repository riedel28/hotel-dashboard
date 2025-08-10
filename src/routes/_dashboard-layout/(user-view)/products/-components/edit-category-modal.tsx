import * as React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Trans } from '@lingui/react/macro';
import { useForm } from 'react-hook-form';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface EditCategoryModalProps {
  open: boolean;
  initialTitle: string;
  onOpenChange: (open: boolean) => void;
  onSave: (newTitle: string) => void;
}

export function EditCategoryModal({
  open,
  initialTitle,
  onOpenChange,
  onSave
}: EditCategoryModalProps) {
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
  }, [initialTitle, open, form]);

  const onSubmit = (values: { title: string }) => {
    onSave(values.title.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Edit category</Trans>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-2 py-2"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Category name</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input id="category-title" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
