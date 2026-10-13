import { Trans, useLingui } from '@lingui/react/macro';
import {
  DownloadIcon,
  FileSpreadsheetIcon,
  Loader2Icon,
  UploadIcon
} from 'lucide-react';
import { useRef, useState } from 'react';
import { ROOM_IMPORT_EXTENSIONS } from 'shared/types/room-imports';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { linkClassName } from '@/components/ui/link';
import { cn } from '@/lib/utils';

import { fileColumns } from './messages';

export const ROOM_TEMPLATES = {
  csv: '/templates/rooms-template.csv',
  xlsx: '/templates/rooms-template.xlsx'
};

interface UploadStepProps {
  /** The server is reading the picked file */
  isChecking: boolean;
  error?: string;
  onPick: (file: File | undefined) => void;
  onCancel: () => void;
}

/** Step 1: drop or choose the file; says what the file should look like. */
export function UploadStep({
  isChecking,
  error,
  onPick,
  onCancel
}: UploadStepProps) {
  const { t } = useLingui();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          onPick(event.dataTransfer.files[0]);
        }}
        className={cn(
          'flex flex-col items-center gap-3 rounded-lg border border-dashed border-input bg-muted px-6 py-10 text-center transition-colors',
          isDragging && 'border-primary bg-primary/10'
        )}
      >
        {isChecking ? (
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        ) : (
          <FileSpreadsheetIcon className="size-8 text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground">
          {isChecking ? (
            <Trans>Checking the file…</Trans>
          ) : (
            <Trans>Drop a .csv or .xlsx file here, up to 5 MB</Trans>
          )}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ROOM_IMPORT_EXTENSIONS.join(',')}
          aria-label={t`File`}
          className="sr-only"
          onChange={(event) => {
            onPick(event.target.files?.[0]);
            // Picking the same file again must fire a change
            event.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isChecking}
          onClick={() => inputRef.current?.click()}
        >
          <UploadIcon aria-hidden="true" />
          <Trans>Choose file</Trans>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-medium">
          <Trans>Columns</Trans>
        </h3>
        <dl className="divide-y rounded-lg border text-sm">
          {fileColumns.map(({ name, required, description }) => (
            <div
              key={name}
              className="grid grid-cols-[4.5rem_1fr] items-baseline gap-x-3 gap-y-0.5 px-3 py-2 sm:grid-cols-[4.5rem_5rem_1fr]"
            >
              <dt>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {name}
                </code>
              </dt>
              <dd
                className={cn(
                  'text-xs',
                  required ? 'font-medium' : 'text-muted-foreground'
                )}
              >
                {required ? <Trans>required</Trans> : <Trans>optional</Trans>}
              </dd>
              <dd className="col-span-2 text-muted-foreground sm:col-span-1">
                {t(description)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground">
          <Trans>
            Columns can be in any order. A column that is missing from the file
            leaves its values unchanged.
          </Trans>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-muted-foreground">
          <Trans>Need a starting point?</Trans>
        </span>
        {(['csv', 'xlsx'] as const).map((format) => (
          <a
            key={format}
            className={cn(linkClassName, 'inline-flex items-center gap-1')}
            href={ROOM_TEMPLATES[format]}
            download
          >
            <DownloadIcon className="size-3.5" />
            {format === 'csv' ? (
              <Trans>CSV template</Trans>
            ) : (
              <Trans>XLSX template</Trans>
            )}
          </a>
        ))}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          <Trans>Cancel</Trans>
        </Button>
      </DialogFooter>
    </>
  );
}
