import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, UploadIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { profileKeys, updateMe } from '@/api/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ACCEPT_ATTRIBUTE,
  formatBytes,
  ImageRejected,
  type LoadedImage,
  loadImageFile,
  releaseImage
} from '@/lib/image';
import { cn } from '@/lib/utils';
import type { User } from '../../../../../../shared/types/users';
import { AvatarCropperDialog } from './avatar-cropper-dialog';

/**
 * Upper bound on the *source* file. The picture is re-encoded to a 256px WebP
 * before it leaves the browser, so this isn't about payload size — it's to stop
 * a 60 MP raw export from locking the tab up while it decodes.
 */
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

/** How long the toast — and with it the chance to undo — stays on screen. */
const UNDO_WINDOW_MS = 8000;

interface AvatarFieldProps {
  user: User;
}

/**
 * The avatar is the one control on this page that saves on its own rather than
 * with the section's Save button: once you've confirmed a crop, leaving the
 * picture in limbo until some other button is pressed reads as broken.
 */
export function AvatarField({ user }: AvatarFieldProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = React.useState(false);
  const [rejection, setRejection] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<LoadedImage | null>(null);
  /** Shown instead of the saved avatar while an upload is in flight. */
  const [preview, setPreview] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState<string | null>(null);
  const [imageBroken, setImageBroken] = React.useState(false);

  const initials =
    `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() ||
    user.email[0]?.toUpperCase() ||
    '?';

  const mutation = useMutation({
    mutationFn: (avatar_url: string | null) => updateMe({ avatar_url }),
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKeys.me, updated);
      setPreview(null);
      setFailed(null);
      setImageBroken(false);
    },
    onError: () => {
      // Hold on to the bytes so Retry doesn't make the user pick the file again.
      setFailed(preview);
    }
  });

  /**
   * Every change to the picture is one call, and every one of them is
   * reversible from its toast — which is why removing doesn't ask first.
   */
  const upload = (dataUri: string | null, previousAvatar: string | null) => {
    setPreview(dataUri);
    mutation.mutate(dataUri, {
      onSuccess: () => {
        toast.success(dataUri ? t`Photo updated` : t`Photo removed`, {
          duration: UNDO_WINDOW_MS,
          action: {
            label: t`Undo`,
            onClick: () => upload(previousAvatar, dataUri)
          }
        });
      }
    });
  };

  const acceptFile = async (file: File) => {
    setRejection(null);

    if (file.size > MAX_SOURCE_BYTES) {
      setRejection(
        t`That file is ${formatBytes(file.size)}. Please choose one under 20 MB.`
      );
      return;
    }

    try {
      const image = await loadImageFile(file);
      setPending(image);
    } catch (error) {
      if (error instanceof ImageRejected) {
        setRejection(
          error.reason === 'unsupported-heic'
            ? t`HEIC photos from iPhone aren't supported. Choose a JPG or PNG, or take a new photo.`
            : error.reason === 'not-an-image'
              ? t`Only images are allowed.`
              : t`That image couldn't be opened. Try a different one.`
        );
        return;
      }
      throw error;
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (files.length > 1) {
      toast.info(t`Only the first image was used`);
    }
    const [first] = files;
    if (first) void acceptFile(first);
  };

  // Dropping outside the target would otherwise make the browser navigate to
  // the file, silently discarding whatever is unsaved on this page.
  React.useEffect(() => {
    const swallow = (event: DragEvent) => event.preventDefault();
    document.addEventListener('dragover', swallow);
    document.addEventListener('drop', swallow);
    return () => {
      document.removeEventListener('dragover', swallow);
      document.removeEventListener('drop', swallow);
    };
  }, []);

  const closeCropper = () => {
    if (pending) releaseImage(pending);
    setPending(null);
  };

  const displayedAvatar = preview ?? user.avatar_url ?? null;
  const isUploading = mutation.isPending;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          // Fires for child elements too; ignore unless the pointer really left.
          if (event.currentTarget.contains(event.relatedTarget as Node)) return;
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        aria-label={t`Change profile picture`}
        className={cn(
          'relative grid size-20 shrink-0 place-items-center rounded-full border-2 border-dashed border-transparent p-1 transition-transform sm:size-24',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
          isDragging && 'border-primary bg-primary/5 scale-102',
          rejection && 'border-destructive'
        )}
      >
        {/* Keyed on whether there's a picture at all: the root latches its
            loading status at "loaded", so without a remount the initials never
            come back once a photo has been removed. */}
        <Avatar
          key={displayedAvatar ? 'photo' : 'initials'}
          size="xl"
          className="size-full border"
        >
          {displayedAvatar && !imageBroken && (
            <AvatarImage
              src={displayedAvatar}
              alt=""
              onError={() => setImageBroken(true)}
            />
          )}
          <AvatarFallback className="text-xl font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        {isDragging && (
          <span className="bg-background/80 absolute inset-0 grid place-items-center rounded-full text-xs font-medium">
            <UploadIcon className="size-5" aria-hidden="true" />
          </span>
        )}

        {isUploading && (
          <span className="bg-background/70 absolute inset-0 grid place-items-center rounded-full">
            <Loader2Icon className="size-6 animate-spin" aria-hidden="true" />
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="sr-only"
        // Driven entirely by the avatar button and Upload button above, both of
        // which are already labelled. Left in the tab order it would announce a
        // third, unlabelled "Choose File" control for the same job.
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          handleFiles(event.target.files);
          // Reset so picking the same file twice still fires a change event.
          event.target.value = '';
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:items-start">
        <div>
          <p className="text-sm font-medium">
            <Trans>Profile picture</Trans>
          </p>
          <p className="text-muted-foreground text-sm">
            <Trans>
              Drop an image here or choose one. It's resized automatically, so
              any size is fine.
            </Trans>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {user.avatar_url ? <Trans>Change</Trans> : <Trans>Upload</Trans>}
          </Button>

          {user.avatar_url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploading}
              onClick={() => upload(null, user.avatar_url ?? null)}
            >
              <Trans>Remove</Trans>
            </Button>
          )}
        </div>

        {rejection && (
          <p role="alert" className="text-danger text-sm">
            {rejection}
          </p>
        )}

        {failed && (
          <p role="alert" className="flex items-center gap-2 text-sm">
            <span className="text-danger">
              <Trans>Upload failed.</Trans>
            </span>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() => upload(failed, user.avatar_url ?? null)}
            >
              <Trans>Retry</Trans>
            </Button>
          </p>
        )}
      </div>

      <AvatarCropperDialog
        image={pending}
        onCancel={closeCropper}
        onConfirm={(dataUri) => {
          closeCropper();
          upload(dataUri, user.avatar_url ?? null);
        }}
      />
    </div>
  );
}
