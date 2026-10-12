import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Loader2Icon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

import { AdyenCredentialsSection } from './adyen-credentials-section';
import { AdyenFormHeader } from './adyen-form-header';
import { type AdyenRequiredField, useAdyenForm } from './use-adyen-form';

// The recipient and mapping codes follow once the provider is connected.
const REQUIRED: AdyenRequiredField[] = ['merchantId', 'apiKey', 'clientKey'];

interface AdyenSetupCardProps {
  /** Back to the provider picker. */
  onBack: () => void;
}

/** Connects Adyen to a property that has no provider yet: credentials alone. */
export function AdyenSetupCard({ onBack }: AdyenSetupCardProps) {
  const formId = React.useId();
  const { form, onSubmit, isSaving } = useAdyenForm({
    saved: null,
    required: REQUIRED,
    savedMessage: msg`Adyen connected`
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
    </Card>
  );
}
