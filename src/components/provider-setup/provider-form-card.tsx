import { Trans } from '@lingui/react/macro';
import { ArrowUpRightIcon, Loader2Icon } from 'lucide-react';
import * as React from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import type { Provider } from 'shared/types/providers';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';

import { LastUpdated } from './last-updated';
import { TestConnection } from './test-connection';
import type { TestConnectionStep } from './test-connection-dialog';

interface ProviderFormCardProps<V extends FieldValues> {
  form: UseFormReturn<V>;
  onSubmit: (data: V) => void | Promise<void>;
  isSaving: boolean;
  /** The provider's name. */
  name: string;
  logo: React.ReactNode;
  /** The provider's documentation, linked from the header when there is some. */
  guideUrl?: string;
  /** The provider as stored, or null while it is being set up. */
  saved: Pick<Provider, 'updated_at' | 'updated_by'> | null;
  /** Opens the picker: "Back" during setup, "Change provider" after. */
  onChooseProvider: () => void;
  testSteps: TestConnectionStep[];
  /** The form's fields. */
  children: React.ReactNode;
  /** Dialogs the form opens, e.g. the one confirming a replacement. */
  dialogs?: React.ReactNode;
}

/**
 * A provider's whole form in one compact card, for the ones with a handful of
 * fields: the same card sets the provider up and edits it afterwards.
 */
export function ProviderFormCard<V extends FieldValues>({
  form,
  onSubmit,
  isSaving,
  name,
  logo,
  guideUrl,
  saved,
  onChooseProvider,
  testSteps,
  children,
  dialogs
}: ProviderFormCardProps<V>) {
  const formId = React.useId();
  const { isDirty } = form.formState;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center-safe gap-2">
            <CardTitle>{name}</CardTitle>

            {guideUrl && (
              <Badge
                variant="outline"
                size="sm"
                className="cursor-pointer bg-accent text-accent-foreground"
                render={
                  <a
                    href={guideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <Trans>Integration Guide</Trans>
                <ArrowUpRightIcon aria-hidden="true" />
              </Badge>
            )}

            {saved && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="text-muted-foreground"
                onClick={onChooseProvider}
                // Leaving for the picker would drop unsaved changes
                disabled={isDirty || isSaving}
              >
                <Trans>Change provider</Trans>
              </Button>
            )}
          </div>
          <div className="flex h-8 w-24 shrink-0 items-center justify-end">
            {logo}
          </div>
        </div>
      </CardHeader>

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

              <TestConnection
                provider={name}
                steps={testSteps}
                validate={() => form.trigger()}
                disabled={isSaving}
              />
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
