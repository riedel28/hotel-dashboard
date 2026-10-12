import { Trans } from '@lingui/react/macro';
import { Loader2Icon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

import { AdyenCredentialsSection } from './adyen-credentials-section';
import { AdyenFormHeader } from './adyen-form-header';
import { ADYEN_SETUP_REQUIRED, useAdyenForm } from './use-adyen-form';

interface AdyenSetupCardProps {
  /** The name of the provider that connecting Adyen would replace. */
  replaces: string | null;
  /** Back to the provider picker. */
  onBack: () => void;
}

/** Connects Adyen to a property that has no provider yet: credentials alone. */
export function AdyenSetupCard({ replaces, onBack }: AdyenSetupCardProps) {
  const formId = React.useId();
  const { form, onSubmit, isSaving, replaceDialog } = useAdyenForm({
    saved: null,
    required: ADYEN_SETUP_REQUIRED,
    replaces
  });

  return (
    <Card className="max-w-4xl">
      <AdyenFormHeader control={form.control} />

      <CardContent>
        <form
          id={formId}
          onSubmit={form.handleSubmit(onSubmit)}
          aria-busy={isSaving}
          noValidate
        >
          <fieldset disabled={isSaving} className="contents">
            <AdyenCredentialsSection form={form} disabled={isSaving} />
          </fieldset>
        </form>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSaving}
        >
          <Trans>Back</Trans>
        </Button>
        <Button type="submit" form={formId} disabled={isSaving}>
          {isSaving && (
            <Loader2Icon className="animate-spin" aria-hidden="true" />
          )}
          <Trans>Connect provider</Trans>
        </Button>
      </CardFooter>

      {replaceDialog}
    </Card>
  );
}
