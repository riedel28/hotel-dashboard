import { Trans, useLingui } from '@lingui/react/macro';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Loader2Icon,
  PlusIcon,
  RotateCcwIcon,
  StarIcon,
  XIcon
} from 'lucide-react';
import * as React from 'react';
import { cmsImageExtensions } from 'shared/types/cms';

import { imageUrl } from '@/api/images';
import { ImagePreviewDialog } from '@/components/image-preview-dialog';
import { Button } from '@/components/ui/button';
import { moveItem, useDragReorder } from '@/hooks/use-drag-reorder';
import { formatBytes } from '@/lib/image';
import { cn } from '@/lib/utils';

interface Upload {
  key: number;
  file: File;
  error?: string;
}

interface ImageFieldProps {
  value: string[];
  onChange: (ids: string[]) => void;
  // 1 for a link's icon; a page's gallery takes many.
  max?: number;
  maxBytes: number;
  /** Uploads into the image store through the feature's own endpoint. */
  upload: (file: File) => Promise<string>;
  /** Marks the first image as the cover. */
  cover?: boolean;
}

const hasImageExtension = (name: string) =>
  cmsImageExtensions.some((extension) =>
    name.toLowerCase().endsWith(extension)
  );

// Uploaded images in order. A file is uploaded as soon as it's picked (each
// slot shows its own progress and error); the node refers to it only once
// the form is saved. Drag to reorder, or use the arrow buttons.
export function ImageField({
  value,
  onChange,
  max = 30,
  maxBytes,
  upload: uploadFile,
  cover = false
}: ImageFieldProps) {
  const { t } = useLingui();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = React.useState<Upload[]>([]);
  const nextKey = React.useRef(0);
  // The latest value, for uploads finishing after other changes.
  const valueRef = React.useRef(value);
  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const { itemProps } = useDragReorder((from, to) =>
    onChange(moveItem(value, from, to))
  );

  const upload = async (entry: Upload) => {
    setUploads((list) =>
      list.map((u) => (u.key === entry.key ? { ...u, error: undefined } : u))
    );
    try {
      const id = await uploadFile(entry.file);
      setUploads((list) => list.filter((u) => u.key !== entry.key));
      // Kept in the ref at once: two uploads may finish before a re-render.
      valueRef.current = [...valueRef.current, id];
      onChange(valueRef.current);
    } catch (error) {
      setUploads((list) =>
        list.map((u) =>
          u.key === entry.key
            ? {
                ...u,
                error: error instanceof Error ? error.message : String(error)
              }
            : u
        )
      );
    }
  };

  const pick = (files: FileList | null) => {
    const room = max - value.length - uploads.length;
    for (const file of [...(files ?? [])].slice(0, Math.max(0, room))) {
      // A dropped file skips the picker's filter.
      const error = !hasImageExtension(file.name)
        ? t`Only JPG, PNG and WebP images`
        : file.size > maxBytes
          ? t`The file is larger than ${formatBytes(maxBytes)}`
          : undefined;
      const entry: Upload = {
        key: nextKey.current++,
        file,
        ...(error && { error })
      };
      setUploads((list) => [...list, entry]);
      if (!error) void upload(entry);
    }
  };
  const [dropping, setDropping] = React.useState(false);
  // The image open at full size
  const [preview, setPreview] = React.useState<number | null>(null);
  const isFileDrag = (event: React.DragEvent) =>
    event.dataTransfer.types.includes('Files');

  const canAdd = value.length + uploads.length < max;

  return (
    <div
      className={cn(
        '-m-1 flex flex-wrap gap-2 rounded-xl p-1',
        dropping && 'ring-dashed bg-accent ring-2 ring-primary'
      )}
      // Files dropped anywhere on the gallery are added like picked ones.
      onDragOver={(event) => {
        if (!isFileDrag(event) || !canAdd) return;
        event.preventDefault();
        setDropping(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setDropping(false);
        }
      }}
      onDrop={(event) => {
        if (!isFileDrag(event)) return;
        event.preventDefault();
        setDropping(false);
        pick(event.dataTransfer.files);
      }}
    >
      {value.map((id, index) => (
        <div
          key={id}
          {...(max > 1 && itemProps(index))}
          className="group relative size-24 overflow-hidden rounded-lg border bg-muted data-dragging:opacity-40 data-drop-target:ring-2 data-drop-target:ring-primary"
        >
          <button
            type="button"
            className="block size-full cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
            aria-label={t`Open image ${index + 1}`}
            onClick={() => setPreview(index)}
          >
            <img
              src={imageUrl(id)}
              alt={t`Image ${index + 1}`}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
              draggable={false}
            />
          </button>
          {cover && index === 0 && (
            <span
              className="absolute top-1 left-1 flex items-center gap-0.5 rounded-sm bg-black/60 px-1 py-0.5 text-[10px] font-medium text-white"
              title={t`Cover image`}
            >
              <StarIcon className="size-3 fill-current" aria-hidden="true" />
              <Trans>Cover</Trans>
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-0.5 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100">
            {max > 1 ? (
              <span className="flex">
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className="text-white hover:bg-white/20 hover:text-white"
                  aria-label={t`Move left`}
                  disabled={index === 0}
                  onClick={() => onChange(moveItem(value, index, index - 1))}
                >
                  <ArrowLeftIcon />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className="text-white hover:bg-white/20 hover:text-white"
                  aria-label={t`Move right`}
                  disabled={index === value.length - 1}
                  onClick={() => onChange(moveItem(value, index, index + 1))}
                >
                  <ArrowRightIcon />
                </Button>
              </span>
            ) : (
              <span />
            )}
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="text-white hover:bg-white/20 hover:text-white"
              aria-label={t`Remove image`}
              onClick={() => onChange(value.filter((other) => other !== id))}
            >
              <XIcon />
            </Button>
          </div>
        </div>
      ))}

      {uploads.map((entry) => (
        <div
          key={entry.key}
          role="status"
          className={cn(
            'relative flex size-24 flex-col items-center justify-center gap-1 rounded-lg border p-1 text-center text-xs',
            entry.error
              ? 'border-danger/50 text-danger'
              : 'text-muted-foreground'
          )}
          title={entry.error ?? entry.file.name}
        >
          {entry.error ? (
            <>
              <span className="line-clamp-2">{entry.error}</span>
              <span className="flex">
                {entry.file.size <= maxBytes &&
                  hasImageExtension(entry.file.name) && (
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label={t`Retry`}
                      onClick={() => void upload(entry)}
                    >
                      <RotateCcwIcon />
                    </Button>
                  )}
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label={t`Dismiss`}
                  onClick={() =>
                    setUploads((list) =>
                      list.filter((u) => u.key !== entry.key)
                    )
                  }
                >
                  <XIcon />
                </Button>
              </span>
            </>
          ) : (
            <>
              <Loader2Icon className="size-5 animate-spin" />
              <span className="sr-only">
                <Trans>Uploading {entry.file.name}</Trans>
              </span>
            </>
          )}
        </div>
      ))}

      {canAdd && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={max === 1 ? t`Add image` : t`Add images`}
          title={max === 1 ? t`Add image` : t`Add images`}
          // Same surface and border colour as an input, dashed.
          className="flex size-24 items-center justify-center rounded-lg border border-dashed border-input bg-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)] focus-visible:outline-none dark:bg-input/30 dark:hover:bg-input/50"
        >
          <PlusIcon className="size-5" />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={max > 1}
        accept={cmsImageExtensions.join(',')}
        onChange={(event) => {
          pick(event.target.files);
          event.target.value = '';
        }}
      />
      <ImagePreviewDialog
        ids={value}
        index={preview}
        onIndexChange={setPreview}
        cover={cover}
      />
    </div>
  );
}
