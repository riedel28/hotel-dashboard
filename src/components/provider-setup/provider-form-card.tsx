import { Trans } from '@lingui/react/macro';
import { Loader2Icon } from 'lucide-react';
import * as React from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import type { Provider, ProviderKind } from 'shared/types/providers';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { cn } from '@/lib/utils';

import { LastUpdated } from './last-updated';
import { ProviderCardHeader } from './provider-card-header';
import { TestConnection } from './test-connection';
import type { TestConnectionStep } from './test-connection-dialog';
import type { ProviderEntry } from './types';

interface ProviderFormCardProps<V extends FieldValues> {
  /** What useProviderForm returned. */
  providerForm: {
    form: UseFormReturn<V>;
    onSubmit: (data: V) => void | Promise<void>;
    isSaving: boolean;
    /** The provider as stored, or null while it is being set up. */
    saved: Pick<Provider, 'updated_at'> | null;
    /** The dialogs the form opens, e.g. the one confirming a replacement. */
    dialogs: React.ReactNode;
  };
  entry: ProviderEntry<ProviderKind>;
  /** Opens the picker: "Back" during setup, "Change provider" after. */
  onChooseProvider: () => void;
  /** Shown after the name in the header. */
  badges?: React.ReactNode;
  /** Adds a "Test connection" button under the fields. */
  testSteps?: TestConnectionStep[];
  /** The form's fields. */
  children: React.ReactNode;
  className?: string;
}

/**
 * A provider's form in one card: the same card sets the provider up ("Back",
 * "Connect provider") and edits it afterwards ("Cancel", "Save changes").
 */
export function ProviderFormCard<V extends FieldValues>({
  providerForm: { form, onSubmit, isSaving, saved, dialogs },
  entry,
  onChooseProvider,
  badges,
  testSteps,
  children,
  className
}: ProviderFormCardProps<V>) {
  const formId = React.useId();
  const { isDirty } = form.formState;

  return (
    <Card className={cn('w-full max-w-lg', className)}>
      <ProviderCardHeader
        entry={entry}
        badges={badges}
        onChangeProvider={saved ? onChooseProvider : undefined}
        // Leaving for the picker would drop unsaved changes
        changeDisabled={isDirty || isSaving}
      />

      <CardContent>
        <form
          id={formId}
          onSubmit={form.handleSubmit(onSubmit)}
          aria-busy={isSaving}
          noValidate
        >
          <fieldset disabled={isSaving} className="contents">
            <FieldGroup>
              {children}

              {testSteps && (
                <TestConnection
                  provider={entry.name}
                  steps={testSteps}
                  validate={() => form.trigger()}
                  disabled={isSaving}
                />
              )}
            </FieldGroup>
          </fieldset>
        </form>
      </CardContent>

      <CardFooter className="-mb-4 flex-wrap justify-end gap-3 border-t border-border/60 py-4! md:-mb-6">
        <div
          className="mr-auto min-w-0 text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {isSaving ? (
            <Trans>Saving changes…</Trans>
          ) : saved && !isDirty ? (
            <LastUpdated saved={saved} />
          ) : null}
        </div>

        <div className="flex gap-2">
          {saved ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={!isDirty || isSaving}
            >
              <Trans>Cancel</Trans>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onChooseProvider}
              disabled={isSaving}
            >
              <Trans>Back</Trans>
            </Button>
          )}
          <Button type="submit" form={formId} disabled={isSaving}>
            {isSaving && (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            )}
            {saved ? (
              <Trans>Save changes</Trans>
            ) : (
              <Trans>Connect provider</Trans>
            )}
          </Button>
        </div>
      </CardFooter>

      {dialogs}
    </Card>
  );
}
