import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  CheckIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  TriangleAlertIcon,
  XIcon
} from 'lucide-react';
import * as React from 'react';
import {
  type CheckinBackground,
  checkinBackgroundMaxBytes,
  checkinBackgroundMinSize,
  type CheckinBackgroundPreset,
  checkinBackgroundPresetPhotos
} from 'shared/types/checkin';
import { imageExtensions } from 'shared/types/images';
import { toast } from 'sonner';

import { uploadCheckinBackground } from '@/api/checkin';
import { imageUrl } from '@/api/images';
import { Button } from '@/components/ui/button';
import { RadioGroup } from '@/components/ui/radio-group';
import { formatBytes } from '@/lib/image';

const presets: { id: CheckinBackgroundPreset; label: MessageDescriptor }[] = [
  { id: 'lobby', label: msg`Lobby` },
  { id: 'reception', label: msg`Reception` },
  { id: 'corridor', label: msg`Corridor` },
  { id: 'entrance', label: msg`Entrance` }
];

// A thumbnail: the tiles are at most ~300 pixels wide, twice that for HiDPI.
const presetThumbnail = (id: CheckinBackgroundPreset) =>
  `${checkinBackgroundPresetPhotos[id]}?w=640&h=360&q=75&auto=format&fit=crop`;

const hasImageExtension = (name: string) =>
  imageExtensions.some((extension) => name.toLowerCase().endsWith(extension));

async function isSmallerThanRecommended(file: File) {
  // Not in every runtime (tests); the warning is only a hint.
  if (typeof createImageBitmap !== 'function') return false;
  try {
    const { width, height } = await createImageBitmap(file);
    return (
      width < checkinBackgroundMinSize.width ||
      height < checkinBackgroundMinSize.height
    );
  } catch {
    return false;
  }
}

interface BackgroundPickerProps {
  background: CheckinBackground;
  /** The uploaded image, kept while another background is picked. */
  customImageId: string | null;
  onChange: (
    background: CheckinBackground,
    customImageId: string | null
  ) => void;
}

/** One tile picked out of none, the presets and the hotel's own image. */
export function BackgroundPicker({
  background,
  customImageId,
  onChange
}: BackgroundPickerProps) {
  const { t } = useLingui();
  const labelId = React.useId();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [tooSmall, setTooSmall] = React.useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    // A file dragged onto the picker skips its filter.
    if (!hasImageExtension(file.name)) {
      toast.error(t`Only JPG, PNG and WebP images`);
      return;
    }
    if (file.size > checkinBackgroundMaxBytes) {
      toast.error(
        t`The file is larger than ${formatBytes(checkinBackgroundMaxBytes)}`
      );
      return;
    }
    setUploading(true);
    try {
      const [id, small] = await Promise.all([
        uploadCheckinBackground(file),
        isSmallerThanRecommended(file)
      ]);
      setTooSmall(small);
      onChange('custom', id);
    } catch (error) {
      // The form keeps what it had.
      console.error('Failed to upload background:', error);
      toast.error(t`Failed to upload the image`, {
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setUploading(false);
    }
  };

  const openPicker = () => inputRef.current?.click();
  const maxSize = formatBytes(checkinBackgroundMaxBytes);
  const fileHint = t`JPG, PNG or WebP · up to ${maxSize} · 1920 × 1080 or larger`;

  return (
    <div className="flex flex-col gap-3">
      <span id={labelId} className="sr-only">
        <Trans>Page background</Trans>
      </span>
      <RadioGroup
        aria-labelledby={labelId}
        value={background}
        onValueChange={(next) =>
          onChange(next as CheckinBackground, customImageId)
        }
        className="grid grid-cols-2 gap-x-4 gap-y-5"
      >
        <Tile value="none" label={t`No background`}>
          {/* The guest app as it looks without one: the form on a plain page */}
          {/* Kept faint: the plainest choice shouldn't be the loudest tile */}
          <div className="flex size-full items-center justify-center bg-muted/60">
            <div className="flex w-1/3 flex-col gap-1 rounded-md bg-background/70 p-1.5 ring-1 ring-foreground/5">
              <div className="h-1 w-3/5 rounded-full bg-foreground/15" />
              <div className="h-1 rounded-full bg-foreground/8" />
              <div className="h-1 rounded-full bg-foreground/8" />
            </div>
          </div>
        </Tile>

        {presets.map(({ id, label }) => (
          <Tile key={id} value={id} label={t(label)}>
            <img
              src={presetThumbnail(id)}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          </Tile>
        ))}

        {customImageId ? (
          <div className="relative">
            <Tile value="custom" label={t`Your image`}>
              <img
                src={imageUrl(customImageId)}
                alt=""
                className="size-full object-cover"
              />
            </Tile>
            <div className="absolute start-2 top-2 flex gap-1">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="shadow-sm"
                aria-label={t`Replace image`}
                onClick={openPicker}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                ) : (
                  <PencilIcon aria-hidden="true" />
                )}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="shadow-sm"
                aria-label={t`Remove image`}
                onClick={() => {
                  setTooSmall(false);
                  onChange(background === 'custom' ? 'none' : background, null);
                }}
                disabled={uploading}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            aria-busy={uploading}
            className="flex flex-col gap-1.5 rounded-lg text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-wait"
          >
            {/* What the file may be, where it is picked */}
            <span className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-foreground/15 px-4 text-center text-muted-foreground transition-colors hover:border-foreground/25 hover:bg-muted/50 hover:text-foreground">
              {uploading ? (
                <Loader2Icon
                  className="size-5 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <PlusIcon className="size-5" aria-hidden="true" />
              )}
              <span className="text-xs text-pretty">{fileHint}</span>
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              <Trans>Your image</Trans>
            </span>
          </button>
        )}
      </RadioGroup>

      <input
        ref={inputRef}
        type="file"
        accept={imageExtensions.join(',')}
        className="hidden"
        data-testid="background-file"
        onChange={(event) => {
          void pick(event.target.files?.[0]);
          // The same file again still counts as a change.
          event.target.value = '';
        }}
      />

      {tooSmall && (
        <p
          role="status"
          className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400"
        >
          <TriangleAlertIcon
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <Trans>
            This image is smaller than 1920 × 1080 pixels and may look blurry on
            large screens.
          </Trans>
        </p>
      )}
    </div>
  );
}

// A picture with its name below. Its edge is a hairline drawn inside it, so
// it never doubles up with the selection; picked, a thin primary ring stands off it
// by a gap of the card's colour, and a tick sits in its corner. Hovering
// shows the same ring, fainter: what a click would do. No press scale: on a
// tile this large it reads as a jolt. Keyboard focus is an outline outside
// the ring, so it never replaces it.
function Tile({
  value,
  label,
  children
}: {
  value: CheckinBackground;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <RadioPrimitive.Root
      value={value}
      aria-label={label}
      className="group/tile flex w-full flex-col gap-1.5 rounded-lg text-start outline-none"
    >
      <span className="relative block aspect-video w-full rounded-lg ring-offset-2 ring-offset-card outline-offset-[5px] transition-shadow duration-150 ease-out group-focus-visible/tile:outline-2 group-focus-visible/tile:outline-ring group-data-checked/tile:ring-[1.5px] group-data-checked/tile:ring-primary group-data-unchecked/tile:group-hover/tile:ring-[1.5px] group-data-unchecked/tile:group-hover/tile:ring-foreground/40">
        <span className="block size-full overflow-hidden rounded-lg">
          {children}
        </span>
        <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-foreground/10 ring-inset" />
        {/* The one accent of the picker; a faint shadow keeps it off dark photos */}
        <RadioPrimitive.Indicator className="absolute end-2 top-2 flex size-[22px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_1px_2px_rgb(0_0_0/0.15)] transition-[opacity,scale] duration-150 ease-out data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0">
          <CheckIcon className="size-3" strokeWidth={3} aria-hidden="true" />
        </RadioPrimitive.Indicator>
      </span>
      <span
        className="text-sm font-medium text-muted-foreground transition-colors group-data-checked/tile:text-foreground"
        aria-hidden="true"
      >
        {label}
      </span>
    </RadioPrimitive.Root>
  );
}
