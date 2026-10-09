import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { Loader2Icon } from 'lucide-react';
import { type KeyboardEvent, type ReactNode, useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { type WorklogMessageData, worklogMessageSchema } from '@/api/worklogs';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

interface WorklogMessageFormProps {
  /** The entry's text when editing; empty for a new entry. */
  message?: string;
  placeholder?: string;
  submitLabel: ReactNode;
  isPending: boolean;
  onSubmit: (message: string) => void;
  /** Editing an entry: shows Cancel and starts with the caret after the text. */
  onCancel?: () => void;
  textareaClassName?: string;
}

/**
 * The one-textarea form behind both adding an entry and editing one. It owns
 * the draft only — the caller owns saving, and remounts the form (by `key`)
 * to clear it.
 */
export function WorklogMessageForm({
  message = '',
  placeholder,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
  textareaClassName
}: WorklogMessageFormProps) {
  const { t } = useLingui();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isEditing = onCancel !== undefined;

  const form = useForm<WorklogMessageData>({
    resolver: zodResolver(worklogMessageSchema),
    mode: 'onChange',
    defaultValues: { message }
  });
  const { isDirty, isValid } = form.formState;

  const submit = form.handleSubmit((values) => onSubmit(values.message));

  useEffect(() => {
    if (!isEditing) return;
    const textarea = textareaRef.current;
    textarea?.focus();
    textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [isEditing]);

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <form className="grid gap-3" onSubmit={submit}>
      <Controller
        control={form.control}
        name="message"
        render={({ field, fieldState }) => {
          // An untouched empty draft is not an error worth showing.
          const invalid = fieldState.invalid && fieldState.isDirty;
          return (
            <Field data-invalid={invalid} className="gap-2">
              <Textarea
                {...field}
                ref={(element) => {
                  field.ref(element);
                  textareaRef.current = element;
                }}
                onKeyDown={onKeyDown}
                className={textareaClassName}
                placeholder={placeholder}
                aria-label={t`Message`}
                aria-invalid={invalid}
                disabled={isPending}
              />
              {invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          );
        }}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            <Trans>Cancel</Trans>
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !isDirty || !isValid}
        >
          {isPending && <Loader2Icon className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
