import { Trans, useLingui } from '@lingui/react/macro';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from 'lucide-react';

import { imageUrl } from '@/api/images';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ImagePreviewDialogProps {
  ids: string[];
  /** The image shown; null keeps the dialog closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
  /** Marks the first image as the cover. */
  cover?: boolean;
}

/**
 * A whole edge of the image steps through the gallery, so the target is
 * hard to miss; the arrow on it gets a backdrop on hover.
 */
function StepButton({
  side,
  label,
  onClick
}: {
  side: 'left' | 'right';
  label: string;
  onClick: () => void;
}) {
  const Icon = side === 'left' ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'group absolute inset-y-0 flex w-1/5 max-w-28 cursor-pointer items-center px-3 outline-none',
        side === 'left' ? 'left-0 justify-start' : 'right-0 justify-end'
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-lg bg-black/25 text-white transition-colors group-hover:bg-black/55 group-focus-visible:ring-2 group-focus-visible:ring-white">
        <Icon className="size-6" aria-hidden="true" />
      </span>
    </button>
  );
}

/** An uploaded image at full size, stepping through the gallery. */
export function ImagePreviewDialog({
  ids,
  index,
  onIndexChange,
  cover = false
}: ImagePreviewDialogProps) {
  const { t } = useLingui();
  // A removed image may leave the index past the end
  const shown = index === null ? null : Math.min(index, ids.length - 1);
  const id = shown === null || shown < 0 ? undefined : ids[shown];
  const step = (by: number) =>
    shown !== null && onIndexChange((shown + by + ids.length) % ids.length);

  return (
    <Dialog
      open={id !== undefined}
      onOpenChange={(open) => !open && onIndexChange(null)}
    >
      <DialogContent
        // The padding matches the close button's offset, so the header row
        // lines up with it and keeps clear of the image
        className="gap-4 p-4 sm:max-w-4xl"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') step(-1);
          if (event.key === 'ArrowRight') step(1);
        }}
      >
        <DialogTitle className="flex min-h-7 items-center gap-2 pr-10 text-sm font-medium">
          <Trans>
            Image {(shown ?? 0) + 1} of {ids.length}
          </Trans>
          {cover && shown === 0 && (
            <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <StarIcon className="size-3 fill-current" aria-hidden="true" />
              <Trans>Cover</Trans>
            </span>
          )}
        </DialogTitle>
        <DialogDescription className="sr-only">
          <Trans>Use the arrow keys to move between the images.</Trans>
        </DialogDescription>

        <div className="relative flex items-center justify-center rounded-lg bg-muted">
          {id && (
            <img
              key={id}
              src={imageUrl(id)}
              alt={t`Image ${(shown ?? 0) + 1}`}
              className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
            />
          )}
          {ids.length > 1 && (
            <>
              <StepButton
                side="left"
                label={t`Previous image`}
                onClick={() => step(-1)}
              />
              <StepButton
                side="right"
                label={t`Next image`}
                onClick={() => step(1)}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
