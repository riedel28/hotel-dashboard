import { Trans, useLingui } from '@lingui/react/macro';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import { useState } from 'react';
import {
  ROOM_IMPORT_EXTENSIONS,
  ROOM_IMPORT_MAX_BYTES,
  type RoomImportMode
} from 'shared/types/room-imports';
import type { UploadError } from 'shared/types/uploads';
import { toast } from 'sonner';

import { ApiError } from '@/api/client';
import {
  applyRoomImport,
  invalidateRooms,
  previewRoomImport
} from '@/api/rooms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import { fileProblemOf } from './messages';
import { PreviewStep } from './preview-step';
import { UploadStep } from './upload-step';

// Only what the browser can tell; the server validates the contents
function browserCheck(file: File): UploadError | undefined {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ROOM_IMPORT_EXTENSIONS.includes(extension)) return 'UNSUPPORTED_FILE';
  if (file.size > ROOM_IMPORT_MAX_BYTES) return 'FILE_TOO_LARGE';
  return undefined;
}

const codeOf = (error: unknown) =>
  error instanceof ApiError ? error.code : undefined;

interface ImportRoomsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Imports rooms from a CSV or XLSX file in two steps: pick the file, then
 * review what the server would do with it and apply exactly that.
 *
 * The wizard's whole state is the file and the mode. The step follows from
 * whether the server has a preview for them, and "stale" from whether the
 * server refused to apply the preview on screen.
 */
export function ImportRoomsDialog({
  open,
  onOpenChange
}: ImportRoomsDialogProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<RoomImportMode>('merge');
  // A file the browser already knows the server would refuse
  const [refused, setRefused] = useState<UploadError>();

  // The preview is the server's: the file is sent again on every change of mode
  const previewQuery = useQuery({
    queryKey: [
      'room-import-preview',
      file?.name,
      file?.size,
      file?.lastModified,
      mode
    ],
    queryFn: () => previewRoomImport(file!, mode),
    enabled: file !== null,
    staleTime: Infinity,
    gcTime: 0,
    // The previous plan stays up, dimmed, while the other mode's loads
    placeholderData: keepPreviousData
  });
  const preview = file ? previewQuery.data : undefined;

  const close = () => {
    onOpenChange(false);
    setFile(null);
    setMode('merge');
    setRefused(undefined);
  };

  const applyMutation = useMutation({
    // The token says which preview is being applied
    mutationFn: (token: string) => applyRoomImport(file!, mode, token),
    onSuccess: async ({ created, updated, deleted, skipped }) => {
      close();
      await invalidateRooms(queryClient);
      toast.success(t`Rooms imported`, {
        description: t`Created ${created}, updated ${updated}, deleted ${deleted}, skipped ${skipped}`
      });
    },
    onError: (error) => {
      // A stale preview is shown in the dialog instead
      if (codeOf(error) !== 'IMPORT_PREVIEW_STALE') {
        toast.error(t`Error importing rooms`);
      }
    }
  });

  // Stale is the preview the server refused; any other preview (another
  // mode, a refreshed one) is not
  const isStale =
    codeOf(applyMutation.error) === 'IMPORT_PREVIEW_STALE' &&
    applyMutation.variables === preview?.token;

  // A file the server refuses sends the wizard back to the first step
  const uploadError =
    refused || previewQuery.error
      ? t(fileProblemOf(refused ?? codeOf(previewQuery.error)))
      : undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
    >
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            <Trans>Import rooms</Trans>
          </DialogTitle>
          <DialogDescription>
            {preview ? (
              <Trans>
                Step 2 of 2: review what {file?.name} will change. Nothing is
                saved until you confirm.
              </Trans>
            ) : (
              <Trans>Step 1 of 2: choose a CSV or XLSX file.</Trans>
            )}
          </DialogDescription>
        </DialogHeader>

        {preview ? (
          <PreviewStep
            // A new plan starts unconfirmed, on its first page
            key={preview.token}
            preview={preview}
            mode={mode}
            onModeChange={setMode}
            isRefreshing={previewQuery.isFetching}
            isStale={isStale}
            onRefresh={() => {
              // Also when the fresh preview turns out to be the same plan
              applyMutation.reset();
              void previewQuery.refetch();
            }}
            isApplying={applyMutation.isPending}
            onApply={() => applyMutation.mutate(preview.token)}
            onBack={() => setFile(null)}
          />
        ) : (
          <UploadStep
            isChecking={previewQuery.isFetching}
            error={uploadError}
            onPick={(picked) => {
              if (!picked) return;
              const refusal = browserCheck(picked);
              setRefused(refusal);
              if (!refusal) setFile(picked);
            }}
            onCancel={close}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
