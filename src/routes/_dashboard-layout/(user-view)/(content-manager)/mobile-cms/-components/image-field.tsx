import { Trans, useLingui } from '@lingui/react/macro';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Loader2Icon,
  PlusIcon,
  RotateCcwIcon,
  XIcon
} from 'lucide-react';
import * as React from 'react';
import { cmsImageExtensions, cmsImageMaxBytes } from 'shared/types/cms';

import { cmsImageUrl, uploadCmsImage } from '@/api/cms';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { moveItem, useDragReorder } from '../-lib/use-drag-reorder';

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
}

// Uploaded images in order. A file is uploaded as soon as it's picked (each
// slot shows its own progress and error); the node refers to it only once
// the form is saved. Drag to reorder, or use the arrow buttons.
export function ImageField({ value, onChange, max = 30 }: ImageFieldProps) {
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
      const id = await uploadCmsImage(entry.file);
      setUploads((list) => list.filter((u) => u.key !== entry.key));
      // Kept in the ref at once: two uploads may finish before a re-render.
      valueRef.current = max === 1 ? [id] : [...valueRef.current, id];
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
    const room = max === 1 ? 1 : max - value.length - uploads.length;
    for (const file of [...(files ?? [])].slice(0, Math.max(0, room))) {
      const tooBig = file.size > cmsImageMaxBytes;
      const entry: Upload = {
        key: nextKey.current++,
        file,
        ...(tooBig && { error: t`The file is larger than 2 MB` })
      };
      setUploads((list) => [...list, entry]);
      if (!tooBig) void upload(entry);
    }
  };

  const canAdd =
    max === 1 ? uploads.length === 0 : value.length + uploads.length < max;

  return (
    <div className="flex flex-wrap gap-2">
      {value.map((id, index) => (
        <div
          key={id}
          {...(max > 1 && itemProps(index))}
          className="group relative size-24 overflow-hidden rounded-lg border bg-muted data-dragging:opacity-40 data-drop-target:ring-2 data-drop-target:ring-primary"
        >
          <img
            src={cmsImageUrl(id)}
            alt={t`Image ${index + 1}`}
            className="size-full object-cover"
            draggable={false}
          />
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
                {entry.file.size <= cmsImageMaxBytes && (
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

      {canAdd && (max > 1 || value.length === 0) && (
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
    </div>
  );
}
