import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { type CmsNodeType, cmsUrlSchema } from 'shared/types/cms';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';

export interface CreateNodeRequest {
  parentId: number | null;
  // Shown in the title; null for a top-level section.
  parentTitle: string | null;
  type?: CmsNodeType;
}

interface CreateNodeDialogProps {
  request: CreateNodeRequest | null;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    type: CmsNodeType;
    title: string;
    url?: string;
  }) => Promise<unknown>;
}

type Values = { type: CmsNodeType; title: string; url: string };

// Asks for what a node can't exist without: its type, the German title and,
// for a link, the URL. The node is created hidden and opened in the editor.
export function CreateNodeDialog({
  request,
  onOpenChange,
  onCreate
}: CreateNodeDialogProps) {
  const { t } = useLingui();
  const schema = React.useMemo(
    () =>
      z
        .object({
          type: z.enum(['page', 'link']),
          title: z
            .string()
            .trim()
            .min(1, t`Title is required`),
          url: z.string()
        })
        .superRefine((values, ctx) => {
          if (
            values.type === 'link' &&
            !cmsUrlSchema.safeParse(values.url).success
          ) {
            ctx.addIssue({
              code: 'custom',
              path: ['url'],
              message: t`Enter a URL starting with http:// or https://`
            });
          }
        }),
    [t]
  );
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'page', title: '', url: '' }
  });
  const type = useWatch({ control: form.control, name: 'type' });

  React.useEffect(() => {
    if (request) {
      form.reset({ type: request.type ?? 'page', title: '', url: '' });
    }
  }, [request, form]);

  const onSubmit = async (values: Values) => {
    try {
      await onCreate({
        type: values.type,
        title: values.title.trim(),
        ...(values.type === 'link' && { url: values.url.trim() })
      });
      onOpenChange(false);
    } catch {
      // The mutation shows the error; the dialog stays open with the input.
    }
  };

  const parentTitle = request?.parentTitle;

  return (
    <Dialog open={request != null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {parentTitle ? (
              <Trans>Add to “{parentTitle}”</Trans>
            ) : (
              <Trans>Add item</Trans>
            )}
          </DialogTitle>
          <DialogDescription>
            <Trans>
              The new item starts hidden, so guests don’t see it until it’s
              ready.
            </Trans>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <SegmentedControl
                  label={t`Type`}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: 'page', label: t`Page` },
                    { value: 'link', label: t`External link` }
                  ]}
                />
              )}
            />
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel htmlFor="cms-new-title">
                    <Trans>Title (German)</Trans>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="cms-new-title"
                    autoFocus
                    maxLength={200}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {type === 'link' && (
              <Controller
                control={form.control}
                name="url"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor="cms-new-url">URL</FieldLabel>
                    <Input
                      {...field}
                      id="cms-new-url"
                      type="url"
                      inputMode="url"
                      placeholder="https://"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}
          </FieldGroup>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Trans>Add</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
