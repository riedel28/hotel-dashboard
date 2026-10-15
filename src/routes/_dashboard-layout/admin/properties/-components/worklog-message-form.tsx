import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { Loader2Icon } from 'lucide-react';
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState
} from 'react';
import { Controller, useForm } from 'react-hook-form';

import { type WorklogMessageData, worklogMessageSchema } from '@/api/worklogs';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// The send shortcut as the keyboard shows it
const MOD_KEY =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad/.test(navigator.userAgent)
    ? '⌘'
    : 'Ctrl';

const kbdClass =
  'rounded border bg-muted px-1 font-sans text-[11px] leading-4 text-muted-foreground';

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
  const [isFocused, setIsFocused] = useState(false);

  const form = useForm<WorklogMessageData>({
    resolver: zodResolver(worklogMessageSchema),
    mode: 'onChange',
    defaultValues: { message }
  });
  const { isDirty, isValid } = form.formState;
  const isExpanded = isEditing || isFocused || form.watch('message') !== '';

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
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  field.onBlur();
                }}
                rows={1}
                ref={(element) => {
                  field.ref(element);
                  textareaRef.current = element;
                }}
                onKeyDown={onKeyDown}
                className={cn(
                  'transition-[min-height,color,box-shadow] duration-150',
                  isExpanded ? textareaClassName : 'min-h-9 resize-none'
                )}
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
      {isExpanded && (
        <div className="flex items-center justify-end gap-2">
          {/* Only where there is a keyboard to press it on */}
          <span className="mr-1 hidden items-center gap-1 text-xs text-muted-foreground pointer-fine:inline-flex">
            <Trans>
              <kbd className={kbdClass}>{MOD_KEY}</kbd>
              <kbd className={kbdClass}>↵</kbd> to save
            </Trans>
          </span>
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
            aria-busy={isPending}
          >
            {isPending && <Loader2Icon className="animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
