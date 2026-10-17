import type { MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react/macro';

import { FieldError } from '@/components/ui/field';

interface CodedFieldErrorProps {
  error?: { message?: string };
  /** The schema's error codes in words; any other message is shown as it is. */
  messages: Record<string, MessageDescriptor>;
}

/**
 * A field's error from a shared schema, which names each broken rule by a
 * code rather than in the user's language.
 */
export function CodedFieldError({ error, messages }: CodedFieldErrorProps) {
  const { t } = useLingui();
  const message = error?.message;
  if (!message) return null;
  const known = messages[message];

  return <FieldError>{known ? t(known) : message}</FieldError>;
}
