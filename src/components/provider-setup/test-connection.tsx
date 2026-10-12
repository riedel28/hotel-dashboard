import { Trans } from '@lingui/react/macro';
import { UnplugIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { StatusDisc } from '@/components/ui/status-disc';
import { useFormatLocalized } from '@/hooks/use-format-localized';

import {
  TestConnectionDialog,
  type TestConnectionResult,
  type TestConnectionStep
} from './test-connection-dialog';

interface TestConnectionProps {
  /** What is being connected to, e.g. "Adyen". */
  provider: string;
  steps: TestConnectionStep[];
  /** Checked before the test starts: it only runs on a valid form. */
  validate: () => Promise<boolean>;
  disabled?: boolean;
}

/** The "Test connection" button of a provider form, with its last result. */
export function TestConnection({
  provider,
  steps,
  validate,
  disabled = false
}: TestConnectionProps) {
  const formatLocalized = useFormatLocalized();
  const [open, setOpen] = React.useState(false);
  const [lastResult, setLastResult] =
    React.useState<TestConnectionResult | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={async () => {
          if (await validate()) setOpen(true);
        }}
        disabled={disabled}
      >
        <UnplugIcon data-icon="inline-start" />
        <Trans>Test connection</Trans>
      </Button>
      {lastResult && (
        <p
          className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <StatusDisc
            variant="solid"
            status={lastResult.passed ? 'success' : 'error'}
            size="xs"
          />
          <span>
            {lastResult.passed ? (
              <Trans>Connection successful</Trans>
            ) : (
              <Trans>Connection failed</Trans>
            )}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <Trans>
              Tested at{' '}
              {formatLocalized(lastResult.finishedAt, { timeStyle: 'short' })}
            </Trans>
          </span>
        </p>
      )}

      <TestConnectionDialog
        open={open}
        onOpenChange={setOpen}
        provider={provider}
        steps={steps}
        onFinished={setLastResult}
      />
    </div>
  );
}
