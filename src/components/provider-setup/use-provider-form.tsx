import { zodResolver } from '@hookform/resolvers/zod';
import type { MessageDescriptor } from '@lingui/core';
import { Trans, useLingui } from '@lingui/react/macro';
import * as React from 'react';
import { type DefaultValues, useForm } from 'react-hook-form';
import {
  type Provider,
  providerConfigSchema,
  type ProviderKind,
  requiresSecret,
  type SaveProviderInput
} from 'shared/types/providers';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useSaveProvider } from '@/hooks/use-provider';

/** The stored form of one provider of a kind. */
type StoredProvider<K extends ProviderKind, P> = Extract<
  Provider<K>,
  { provider: P }
>;

/** What that provider's form edits: its configuration and its secret. */
export type ProviderFormValues<
  K extends ProviderKind,
  P extends Provider<K>['provider']
> =
  StoredProvider<K, P> extends { config: infer Config }
    ? Config & { secret: string }
    : never;

type FieldMessages<
  K extends ProviderKind,
  P extends Provider<K>['provider']
> = Partial<
  Record<Exclude<keyof ProviderFormValues<K, P>, 'secret'>, MessageDescriptor>
>;

interface UseProviderFormOptions<
  K extends ProviderKind,
  P extends Provider<K>['provider']
> {
  kind: K;
  provider: P;
  /** The provider's name, for the messages. */
  name: string;
  /** The property's stored provider of this kind, if it is this one. */
  saved: Provider<K> | null;
  emptyValues: ProviderFormValues<K, P>;
  /**
   * What the form says about a field the provider's schema rejects: the rules
   * are the schema's (shared/types/providers.ts), the wording is the form's.
   * Keep the object's identity stable: the validation is built from it.
   */
  messages: FieldMessages<K, P>;
  /**
   * Fields this form insists on beyond the schema, with what it says when one
   * is empty. Keep its identity stable too.
   */
  required?: FieldMessages<K, P>;
  /**
   * What the form says when the provider needs a secret (see requiresSecret)
   * and has none: neither stored nor entered.
   */
  secretRequired: MessageDescriptor;
  /** The name of the provider a save would replace: asked about first. */
  replaces?: string | null;
}

/** What useProviderForm returns: a provider's form, ready for its card. */
export type ProviderForm<
  K extends ProviderKind,
  P extends Provider<K>['provider']
> = ReturnType<typeof useProviderForm<K, P>>;

/**
 * The form of one provider: its values follow the stored configuration, a
 * save sends them to the server, and replacing another provider is confirmed.
 */
export function useProviderForm<
  K extends ProviderKind,
  P extends Provider<K>['provider']
>({
  kind,
  provider,
  name,
  saved,
  emptyValues,
  messages,
  required,
  secretRequired,
  replaces = null
}: UseProviderFormOptions<K, P>) {
  type Values = ProviderFormValues<K, P>;

  const { t } = useLingui();
  const save = useSaveProvider(kind);
  // The values of a save waiting for the replacement to be confirmed
  const [pending, setPending] = React.useState<Values | null>(null);

  // Told apart by `provider`, which the compiler cannot follow through the
  // type parameter: this check is what makes the configuration this form's.
  const stored =
    saved?.provider === provider ? (saved as StoredProvider<K, P>) : null;
  const isStored = stored !== null;
  const secretStored = stored?.secretConfigured ?? false;

  // The provider's own schema decides what is valid, the same one the server
  // applies; this only words its verdict and adds what the form insists on.
  const schema = React.useMemo(
    () =>
      z.custom<Values>().superRefine((data, ctx) => {
        const issue = (field: string, message?: MessageDescriptor) => {
          if (message) {
            ctx.addIssue({
              code: 'custom',
              path: [field],
              message: t(message)
            });
          }
        };
        const worded: Record<string, MessageDescriptor | undefined> = messages;
        const entered: Record<string, unknown> = data;

        // A rule the form has no wording for still shows, in the schema's words
        const result = providerConfigSchema(provider).safeParse(data);
        for (const { path, message } of result.error?.issues ?? []) {
          const wording = worded[String(path[0])];
          ctx.addIssue({
            code: 'custom',
            path,
            message: wording ? t(wording) : message
          });
        }

        const insisted: typeof worded = required ?? {};
        for (const [field, message] of Object.entries(insisted)) {
          if (!String(entered[field] ?? '').trim()) issue(field, message);
        }

        // A stored secret is kept by leaving the field empty
        if (requiresSecret(provider, data) && !secretStored && !data.secret) {
          issue('secret', secretRequired);
        }
      }),
    [provider, messages, required, secretRequired, secretStored, t]
  );

  // Follows the stored configuration: saving it resets the form to it, which
  // also empties the secret's field again.
  const values = React.useMemo(
    (): Values => ({ ...emptyValues, ...stored?.config }),
    [emptyValues, stored]
  );

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues as DefaultValues<Values>,
    values
  });

  const send = async ({ secret, ...config }: Values) => {
    try {
      // `emptyValues` ties the values to this provider's configuration; the
      // compiler cannot carry that through the type parameters to the union.
      await save.mutateAsync({
        provider,
        secret,
        config
      } as SaveProviderInput<K>);
      toast.success(isStored ? t`Configuration updated` : t`${name} connected`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t`Failed to save configuration`
      );
    }
  };

  const onSubmit = (data: Values) => {
    if (replaces) {
      setPending(data);
      return;
    }
    return send(data);
  };

  const dialogs = (
    <AlertDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) setPending(null);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>
              Replace {replaces} with {name}?
            </Trans>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Trans>
              A property has one provider of a kind. Connecting {name} removes
              the {replaces} configuration, including its credentials.
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Cancel</Trans>
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (pending) void send(pending);
              setPending(null);
            }}
          >
            <Trans>Replace provider</Trans>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    form,
    onSubmit,
    isSaving: save.isPending,
    /** The stored provider, when it is this form's. */
    saved: stored,
    secretStored,
    dialogs
  };
}
