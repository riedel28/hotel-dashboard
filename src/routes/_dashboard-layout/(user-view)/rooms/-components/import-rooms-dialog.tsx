import { Plural, Trans, useLingui } from '@lingui/react/macro';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import {
  ArrowRightIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  Loader2Icon,
  UploadIcon
} from 'lucide-react';
import { Fragment, type ReactNode, useRef, useState } from 'react';
import {
  ROOM_IMPORT_COLUMNS,
  ROOM_IMPORT_EXTENSIONS,
  ROOM_IMPORT_MAX_BYTES,
  type RoomImportMode,
  type RoomImportPreview,
  type RoomImportRow
} from 'shared/types/room-imports';
import { toast } from 'sonner';

import { ApiError } from '@/api/client';
import { applyRoomImport, previewRoomImport } from '@/api/rooms';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export const ROOM_TEMPLATES = {
  csv: '/templates/rooms-template.csv',
  xlsx: '/templates/rooms-template.xlsx'
};

// The colors of <Link>, for links that download instead of navigating
const templateLinkClassName =
  'inline-flex items-center gap-1 rounded-sm text-cyan-800 underline-offset-4 outline-none hover:underline focus-visible:shadow-[0_0_0_2px_var(--color-primary)] dark:text-cyan-200/85';

const PAGE_SIZE = 50;

type StatusFilter = 'all' | 'changes' | 'errors';

const matchesFilter: Record<StatusFilter, (row: RoomImportRow) => boolean> = {
  all: () => true,
  changes: (row) => row.status === 'new' || row.status === 'changed',
  errors: (row) => row.status === 'error'
};

/** Two or three choices of which one is always on. */
function Segmented<T extends string>({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex gap-1 rounded-lg bg-muted p-1"
    >
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={option.value === value ? 'outline' : 'ghost'}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

interface ImportRoomsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Imports rooms from a CSV or XLSX file in two steps: pick the file, then
 * review what the server would do with it and apply exactly that.
 */
export function ImportRoomsDialog({
  open,
  onOpenChange
}: ImportRoomsDialogProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<RoomImportMode>('merge');
  const [fileError, setFileError] = useState<string>();
  // The server refused to apply: the rooms changed after the preview
  const [isStale, setIsStale] = useState(false);

  const fileProblems: Record<string, string> = {
    FILE_TOO_LARGE: t`The file is larger than 5 MB.`,
    UNSUPPORTED_FILE: t`Only .csv and .xlsx files can be imported.`,
    UNREADABLE_FILE: t`The file could not be read. Check that it is a valid CSV or XLSX file.`,
    EMPTY_FILE: t`The file has no rows.`,
    MISSING_COLUMNS: t`The file needs the columns "number" and "type".`,
    TOO_MANY_ROWS: t`The file has more than 5000 rows.`
  };

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

  const reset = () => {
    setFile(null);
    setMode('merge');
    setFileError(undefined);
    setIsStale(false);
  };

  const close = () => {
    onOpenChange(false);
    reset();
  };

  const pickFile = (picked: File | undefined) => {
    if (!picked) return;
    // Only what the browser can tell; the server validates the contents
    const extension = picked.name.slice(picked.name.lastIndexOf('.'));
    if (!ROOM_IMPORT_EXTENSIONS.includes(extension.toLowerCase())) {
      return setFileError(fileProblems.UNSUPPORTED_FILE);
    }
    if (picked.size > ROOM_IMPORT_MAX_BYTES) {
      return setFileError(fileProblems.FILE_TOO_LARGE);
    }
    setFileError(undefined);
    setIsStale(false);
    setFile(picked);
  };

  const applyMutation = useMutation({
    mutationFn: () => applyRoomImport(file!, mode, preview!.token),
    onSuccess: async ({ created, updated, deleted, skipped }) => {
      close();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rooms'] }),
        // The room picker lists the rooms too
        queryClient.invalidateQueries({ queryKey: ['devices', 'room-options'] })
      ]);
      toast.success(t`Rooms imported`, {
        description: t`Created ${created}, updated ${updated}, deleted ${deleted}, skipped ${skipped}`
      });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        return setIsStale(true);
      }
      toast.error(t`Error importing rooms`);
    }
  });

  // A file the server refuses sends the wizard back to the first step
  const previewError =
    previewQuery.error instanceof ApiError
      ? (fileProblems[previewQuery.error.code ?? ''] ??
        t`The file could not be checked. Try again.`)
      : previewQuery.error
        ? t`The file could not be checked. Try again.`
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
            onModeChange={(next) => {
              setIsStale(false);
              setMode(next);
            }}
            isRefreshing={previewQuery.isFetching}
            isStale={isStale}
            onRefresh={() => {
              setIsStale(false);
              void previewQuery.refetch();
            }}
            isApplying={applyMutation.isPending}
            onApply={() => applyMutation.mutate()}
            onBack={reset}
          />
        ) : (
          <UploadStep
            isChecking={previewQuery.isFetching}
            error={fileError ?? previewError}
            onPick={pickFile}
            onCancel={close}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function UploadStep({
  isChecking,
  error,
  onPick,
  onCancel
}: {
  isChecking: boolean;
  error?: string;
  onPick: (file: File | undefined) => void;
  onCancel: () => void;
}) {
  const { t } = useLingui();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const columns = [
    {
      name: 'number',
      required: true,
      description: t`Room number, e.g. 12A. Rooms are matched by it.`
    },
    {
      name: 'type',
      required: true,
      description: t`Room type, e.g. Standard or Suite.`
    },
    {
      name: 'name',
      required: false,
      description: t`An empty cell names the room by its number.`
    },
    {
      name: 'floor',
      required: false,
      description: t`A whole number; an empty cell clears the floor.`
    }
  ] satisfies {
    name: (typeof ROOM_IMPORT_COLUMNS)[number];
    required: boolean;
    description: string;
  }[];

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
          {columns.map(({ name, required, description }) => (
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
                {description}
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
        <a className={templateLinkClassName} href={ROOM_TEMPLATES.csv} download>
          <DownloadIcon className="size-3.5" />
          <Trans>CSV template</Trans>
        </a>
        <a
          className={templateLinkClassName}
          href={ROOM_TEMPLATES.xlsx}
          download
        >
          <DownloadIcon className="size-3.5" />
          <Trans>XLSX template</Trans>
        </a>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          <Trans>Cancel</Trans>
        </Button>
      </DialogFooter>
    </>
  );
}

// A filter's name with how many rows it shows
const counted = (label: ReactNode, count: number) => (
  <>
    {label}
    <span className="text-muted-foreground tabular-nums">{count}</span>
  </>
);

function NewTypeBadge() {
  return (
    <Badge variant="outline" size="xs" color="yellow">
      <Trans>New type</Trans>
    </Badge>
  );
}

const statusColors: Record<RoomImportRow['status'], BadgeProps['color']> = {
  new: 'emerald',
  changed: 'sky',
  unchanged: 'gray',
  error: 'red'
};

function PreviewStep({
  preview,
  mode,
  onModeChange,
  isRefreshing,
  isStale,
  onRefresh,
  isApplying,
  onApply,
  onBack
}: {
  preview: RoomImportPreview;
  mode: RoomImportMode;
  onModeChange: (mode: RoomImportMode) => void;
  isRefreshing: boolean;
  isStale: boolean;
  onRefresh: () => void;
  isApplying: boolean;
  onApply: () => void;
  onBack: () => void;
}) {
  const { t } = useLingui();
  const { summary, deletions } = preview;
  // Rows that change nothing are hidden until asked for
  const [filter, setFilter] = useState<StatusFilter>('changes');
  const [page, setPage] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const rows = preview.rows.filter(matchesFilter[filter]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const shown = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const changeCount = summary.create + summary.update;
  const isReplace = preview.mode === 'replace';
  const isBusy = isRefreshing || isApplying;

  const statusLabels: Record<RoomImportRow['status'], string> = {
    new: t`New`,
    changed: t`Changed`,
    unchanged: t`Unchanged`,
    error: t`Error`
  };
  const fieldLabels = { name: t`Name`, room_type: t`Type`, floor: t`Floor` };
  const rowErrors = {
    MISSING_NUMBER: t`No room number`,
    MISSING_TYPE: t`No room type`,
    INVALID_FLOOR: t`The floor is not a whole number`,
    DUPLICATE_NUMBER: t`The number appears more than once in the file`,
    NAME_LOCKED: t`The room has an active reservation and cannot be renamed`
  };

  const stats = [
    {
      label: t`To create`,
      count: summary.create,
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      label: t`To update`,
      count: summary.update,
      color: 'text-sky-600 dark:text-sky-400'
    },
    { label: t`Unchanged`, count: summary.unchanged, color: '' },
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
          <Segmented
            label={t`Import mode`}
            value={mode}
            onChange={onModeChange}
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

        <section className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium">
              <Trans>Rows in the file</Trans>
            </h3>
            <Segmented
              label={t`Rows shown`}
              value={filter}
              onChange={(next) => {
                setFilter(next);
                setPage(0);
              }}
              options={[
                {
                  value: 'changes',
                  label: counted(<Trans>Changes</Trans>, changeCount)
                },
                {
                  value: 'errors',
                  label: counted(<Trans>Errors</Trans>, summary.errors)
                },
                {
                  value: 'all',
                  label: counted(<Trans>All</Trans>, preview.rows.length)
                }
              ]}
            />
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-14">
                    <Trans>Line</Trans>
                  </TableHead>
                  <TableHead className="w-24">
                    <Trans>Number</Trans>
                  </TableHead>
                  <TableHead className="w-28">
                    <Trans>Status</Trans>
                  </TableHead>
                  <TableHead>
                    <Trans>Details</Trans>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      <Trans>No rows to show</Trans>
                    </TableCell>
                  </TableRow>
                )}
                {shown.map((row) => (
                  <TableRow key={row.line} className="align-top">
                    <TableCell className="text-muted-foreground tabular-nums">
                      {row.line}
                    </TableCell>
                    <TableCell className="font-medium">
                      {row.room_number || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        size="sm"
                        color={statusColors[row.status]}
                      >
                        {statusLabels[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {row.status === 'error' && (
                        <ul className="space-y-0.5 text-danger">
                          {row.errors.map((code) => (
                            <li key={code}>{rowErrors[code]}</li>
                          ))}
                        </ul>
                      )}
                      {row.status === 'changed' && (
                        <dl className="grid grid-cols-[3.5rem_1fr] gap-x-3 gap-y-0.5">
                          {row.changes.map(({ field, from, to }) => (
                            <Fragment key={field}>
                              <dt className="text-muted-foreground">
                                {fieldLabels[field]}
                              </dt>
                              <dd className="flex flex-wrap items-center gap-x-1.5">
                                <span className="text-muted-foreground line-through">
                                  {from ?? '—'}
                                </span>
                                <ArrowRightIcon
                                  aria-label={t`becomes`}
                                  className="size-3 shrink-0 text-muted-foreground"
                                />
                                <span className="font-medium">{to ?? '—'}</span>
                                {field === 'room_type' && row.is_new_type && (
                                  <NewTypeBadge />
                                )}
                              </dd>
                            </Fragment>
                          ))}
                        </dl>
                      )}
                      {(row.status === 'new' || row.status === 'unchanged') && (
                        <span className="flex flex-wrap items-center gap-x-1.5 text-muted-foreground">
                          {[
                            row.name,
                            row.room_type,
                            row.floor === null ? null : t`Floor ${row.floor}`
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                          {row.is_new_type && <NewTypeBadge />}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {(summary.errors > 0 || pageCount > 1) && (
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <p>
                {summary.errors > 0 && (
                  <Trans>Rows with errors are skipped.</Trans>
                )}
              </p>
              {pageCount > 1 && (
                <div className="flex items-center gap-2">
                  <span className="tabular-nums">
                    <Trans>
                      Page {page + 1} of {pageCount}
                    </Trans>
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    <Trans>Previous</Trans>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={page >= pageCount - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    <Trans>Next</Trans>
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>

        {isReplace && deletions.length > 0 && (
          <section
            aria-label={t`Rooms to delete`}
            className="overflow-hidden rounded-lg border border-danger/40"
          >
            <div className="space-y-2 p-3">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <Trans>Rooms that are not in the file</Trans>
                <span className="font-normal text-muted-foreground tabular-nums">
                  {deletions.length}
                </span>
              </h3>
              <ul className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto text-xs">
                {deletions.map((room) => (
                  <li
                    key={room.id}
                    className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1"
                  >
                    <span className="font-medium">{room.room_number}</span>
                    {room.name !== room.room_number && (
                      <span className="text-muted-foreground">{room.name}</span>
                    )}
                    {room.has_active_reservation && (
                      <Badge variant="outline" size="xs" color="yellow">
                        <Trans>Active reservation — will be skipped</Trans>
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {summary.delete > 0 && (
              <label className="flex items-center gap-2 border-t border-danger/40 bg-danger/5 px-3 py-2.5 text-sm font-medium">
                <Checkbox
                  checked={isConfirmed}
                  onCheckedChange={(checked) =>
                    setIsConfirmed(checked === true)
                  }
                />
                <Plural
                  value={summary.delete}
                  one="I understand that # room will be deleted"
                  other="I understand that # rooms will be deleted"
                />
              </label>
            )}
          </section>
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
              isBusy ||
              isStale ||
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
            disabled={isBusy || isStale || changeCount === 0}
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
