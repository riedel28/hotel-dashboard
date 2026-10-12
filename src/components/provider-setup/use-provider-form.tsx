import { zodResolver } from '@hookform/resolvers/zod';
import type { MessageDescriptor } from '@lingui/core';
import { Trans, useLingui } from '@lingui/react/macro';
import * as React from 'react';
import { type DefaultValues, useForm } from 'react-hook-form';
import type {
  ConfigurableKind,
  SaveProviderInput
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

/** A provider's configuration plus its secret, as its form edits them. */
type ProviderFormValues = { secret: string } & Record<string, unknown>;

interface UseProviderFormOptions<
  K extends ConfigurableKind,
  V extends ProviderFormValues
> {
  kind: K;
  provider: SaveProviderInput<K>['provider'];
  /** The provider's name, for the messages. */
  name: string;
  /** The stored configuration the form starts from and resets to, if any. */
  config: Partial<V> | undefined;
  emptyValues: V;
  /**
   * The fields that must be filled in, with what the form says when one is
   * empty. Keep the object's identity stable: the validation is built from it.
   */
  required: Partial<Record<keyof V, MessageDescriptor>>;
  /** Anything else to check. Keep its identity stable too. */
  refine?: (
    data: V,
    ctx: z.RefinementCtx,
    t: (message: MessageDescriptor) => string
  ) => void;
  /** The name of the provider a save would replace: asked about first. */
  replaces?: string | null;
}

/**
 * The form of one provider: its values follow the stored configuration, a
 * save sends them to the server, and replacing another provider is confirmed.
 */
export function useProviderForm<
  K extends ConfigurableKind,
  V extends ProviderFormValues
>({
  kind,
  provider,
  name,
  config,
  emptyValues,
  required,
  refine,
  replaces = null
}: UseProviderFormOptions<K, V>) {
  const { t } = useLingui();
  const save = useSaveProvider(kind);
  // The values of a save waiting for the replacement to be confirmed
  const [pending, setPending] = React.useState<V | null>(null);

  // The server owns the shape of a configuration (shared/types/providers.ts);
  // this only adds what a form has to say before the request is sent.
  const schema = React.useMemo(
    () =>
      z.custom<V>().superRefine((data, ctx) => {
        for (const [field, message] of Object.entries(required)) {
          if (message && !String(data[field] ?? '').trim()) {
            ctx.addIssue({
              code: 'custom',
              path: [field],
              message: t(message)
            });
          }
        }
        refine?.(data, ctx, t);
      }),
    [required, refine, t]
  );

  // Follows the stored configuration: saving it resets the form to it, which
  // also empties the secret's field again.
  const values = React.useMemo<V>(
    () => ({ ...emptyValues, ...config }),
    [emptyValues, config]
  );

  const form = useForm<V>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues as DefaultValues<V>,
    values
  });

  const send = async ({ secret, ...rest }: V) => {
    try {
      // The provider's own form produced these values: what pairs a provider
      // with its configuration is that form, not this hook.
      await save.mutateAsync({
        provider,
        secret,
        config: rest
      } as SaveProviderInput<K>);
      toast.success(config ? t`Configuration updated` : t`${name} connected`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t`Failed to save configuration`
      );
    }
  };

  const onSubmit = (data: V) => {
    if (replaces) {
      setPending(data);
      return;
    }
    return send(data);
  };

  const replaceDialog = (
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

  return { form, onSubmit, isSaving: save.isPending, replaceDialog };
}
