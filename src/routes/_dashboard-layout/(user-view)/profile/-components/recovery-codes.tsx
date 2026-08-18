import { Trans, useLingui } from '@lingui/react/macro';
import { CheckIcon, CopyIcon, DownloadIcon, PrinterIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks';

interface RecoveryCodesProps {
  codes: string[];
}

/**
 * The codes are shown exactly once, so all three ways of keeping them are
 * offered side by side rather than hidden behind a menu — whichever one the
 * user reaches for, this is their only chance to use it.
 */
export function RecoveryCodes({ codes }: RecoveryCodesProps) {
  const { t } = useLingui();
  const { copied, copy } = useCopyToClipboard();
  const asText = codes.join('\n');

  const download = () => {
    const blob = new Blob(
      [
        `${t`Recovery codes`}\n`,
        `${t`Each code can be used once.`}\n\n`,
        `${asText}\n`
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recovery-codes.txt';
    link.click();
    // Revoked a tick later, not inline: some browsers read the blob after the
    // click returns, and pulling the URL out from under them cancels the save.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const print = () => {
    const frame = document.createElement('iframe');
    frame.style.position = 'fixed';
    frame.style.right = '100%';
    frame.setAttribute('aria-hidden', 'true');
    document.body.appendChild(frame);

    const doc = frame.contentDocument;
    if (!doc) {
      document.body.removeChild(frame);
      return;
    }

    // Plain document rather than window.print() on the page itself, which would
    // print the whole dashboard around the codes.
    doc.write(
      `<pre style="font:14px ui-monospace,monospace;line-height:1.8">${asText}</pre>`
    );
    doc.close();
    frame.contentWindow?.focus();
    frame.contentWindow?.print();

    window.setTimeout(() => document.body.removeChild(frame), 1000);
  };

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg border bg-muted/40 p-4 font-mono text-sm sm:grid-cols-3">
        {codes.map((code) => (
          <li key={code} className="tracking-wide tabular-nums">
            {code}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={download}>
          <DownloadIcon aria-hidden="true" />
          <Trans>Download .txt</Trans>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void copy(asText);
            toast.success(t`Recovery codes copied`);
          }}
        >
          {copied ? (
            <CheckIcon aria-hidden="true" />
          ) : (
            <CopyIcon aria-hidden="true" />
          )}
          <Trans>Copy</Trans>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={print}>
          <PrinterIcon aria-hidden="true" />
          <Trans>Print</Trans>
        </Button>
      </div>
    </div>
  );
}
