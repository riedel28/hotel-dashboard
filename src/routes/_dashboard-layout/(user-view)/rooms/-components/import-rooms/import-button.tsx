import { Trans, useLingui } from '@lingui/react/macro';
import { ChevronDownIcon, DownloadIcon, UploadIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { ROOM_TEMPLATES } from './upload-step';

/** One control: Import, with the file templates behind the arrow. */
export function ImportButton({ onImport }: { onImport: () => void }) {
  const { t } = useLingui();

  return (
    <div className="flex">
      <Button variant="outline" className="rounded-r-none" onClick={onImport}>
        <UploadIcon />
        <Trans>Import</Trans>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(props) => (
            <Button
              variant="outline"
              aria-label={t`Download template`}
              // No left border: the Import button's right one is the divider. Two
              // overlapping borders would add up, the dark one being translucent
              className="rounded-l-none border-l-0 px-2"
              {...props}
            >
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          )}
        />
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuItem
            render={(props) => (
              <a {...props} href={ROOM_TEMPLATES.csv} download>
                <DownloadIcon />
                <Trans>Download CSV template</Trans>
              </a>
            )}
          />
          <DropdownMenuItem
            render={(props) => (
              <a {...props} href={ROOM_TEMPLATES.xlsx} download>
                <DownloadIcon />
                <Trans>Download XLSX template</Trans>
              </a>
            )}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
