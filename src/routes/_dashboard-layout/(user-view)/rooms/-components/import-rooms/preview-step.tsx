import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import type {
  RoomImportMode,
  RoomImportPreview
} from 'shared/types/room-imports';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { cn } from '@/lib/utils';

import { PreviewDeletions } from './preview-deletions';
import { PreviewRows } from './preview-rows';

interface PreviewStepProps {
  preview: RoomImportPreview;
  /** The mode asked for; the preview shown may still be the other one's */
  mode: RoomImportMode;
  onModeChange: (mode: RoomImportMode) => void;
  isRefreshing: boolean;
  /** The server refused to apply this preview: the rooms have changed */
  isStale: boolean;
  onRefresh: () => void;
  isApplying: boolean;
  onApply: () => void;
  onBack: () => void;
}

/** Step 2: what the file would do, in the chosen mode, and the button to do it. */
export function PreviewStep({
  preview,
  mode,
  onModeChange,
  isRefreshing,
  isStale,
  onRefresh,
  isApplying,
  onApply,
  onBack
}: PreviewStepProps) {
  const { t } = useLingui();
  const { summary, deletions } = preview;
  const [isConfirmed, setIsConfirmed] = useState(false);

  const isReplace = preview.mode === 'replace';
  const changeCount = summary.create + summary.update;
  const cannotApply = isRefreshing || isApplying || isStale;

  const stats = [
    {
      label: t`To create`,
      count: summary.create,
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    { label: t`To update`, count: summary.update },
    { label: t`Unchanged`, count: summary.unchanged },
    { label: t`Errors`, count: summary.errors, color: 'text-danger' },
    ...(isReplace
      ? [{ label: t`To delete`, count: summary.delete, color: 'text-danger' }]
      : [])
  ];

  return (
    <>
      <div
        className={cn(
          'min-h-0 flex-1 space-y-5 overflow-y-auto transition-opacity',
          isRefreshing && 'opacity-60'
        )}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <SegmentedControl
            label={t`Import mode`}
            value={mode}
            onValueChange={onModeChange}
            options={[
              { value: 'merge', label: <Trans>Merge</Trans> },
              { value: 'replace', label: <Trans>Replace all</Trans> }
            ]}
          />
          <p className="text-sm text-muted-foreground">
            {isReplace ? (
              <Trans>
                Adds and updates rooms, and deletes those that are not in the
                file.
              </Trans>
            ) : (
              <Trans>
                Adds and updates rooms. Rooms that are not in the file stay as
                they are.
              </Trans>
            )}
          </p>
        </div>

        <dl
          aria-label={t`Summary`}
          className={cn(
            'grid grid-cols-2 gap-2',
            isReplace ? 'sm:grid-cols-5' : 'sm:grid-cols-4'
          )}
        >
          {stats.map(({ label, count, color }) => (
            // Reversed, so the number reads first while the label stays the term
            <div
              key={label}
              className="flex flex-col-reverse rounded-lg border px-3 py-2"
            >
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd
                className={cn(
                  'text-xl font-semibold tabular-nums',
                  count > 0 ? color : 'text-muted-foreground'
                )}
              >
                {count}
              </dd>
            </div>
          ))}
        </dl>

        {isStale && (
          <Alert variant="warning" role="alert">
            <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
              <Trans>
                The rooms have changed since this preview was made. Nothing was
                imported.
              </Trans>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onRefresh}
              >
                <Trans>Refresh preview</Trans>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <PreviewRows rows={preview.rows} />

        {isReplace && deletions.length > 0 && (
          <PreviewDeletions
            deletions={deletions}
            deleteCount={summary.delete}
            isConfirmed={isConfirmed}
            onConfirmedChange={setIsConfirmed}
          />
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isApplying}
        >
          <Trans>Back</Trans>
        </Button>
        {isReplace ? (
          <Button
            type="button"
            variant="destructive"
            disabled={
              cannotApply ||
              changeCount + summary.delete === 0 ||
              (summary.delete > 0 && !isConfirmed)
            }
            onClick={onApply}
          >
            {isApplying && <Loader2Icon className="animate-spin" />}
            <Trans>Replace (delete {summary.delete})</Trans>
          </Button>
        ) : (
          <Button
            type="button"
            disabled={cannotApply || changeCount === 0}
            onClick={onApply}
          >
            {isApplying && <Loader2Icon className="animate-spin" />}
            <Plural
              value={changeCount}
              one="Import # change"
              other="Import # changes"
            />
          </Button>
        )}
      </DialogFooter>
    </>
  );
}
