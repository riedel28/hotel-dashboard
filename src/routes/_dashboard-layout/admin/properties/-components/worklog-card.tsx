import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, PencilIcon, Trash2Icon } from 'lucide-react';
import { type KeyboardEvent, type ReactNode, useState } from 'react';
import { toast } from 'sonner';

import {
  deleteWorklog,
  updateWorklog,
  type Worklog,
  worklogsQueryOptions,
  type WorklogUser
} from '@/api/worklogs';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DataGridRowActions } from '@/components/ui/data-grid-row-actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Item } from '@/components/ui/item';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

const MAX_LENGTH = 2000;

interface WorklogMessageFormProps {
  initial?: string;
  placeholder?: string;
  submitLabel: ReactNode;
  /** Resolves once the message is saved; the form then resets to `initial`. */
  onSubmit: (message: string) => Promise<unknown>;
  onCancel?: () => void;
  autoFocus?: boolean;
  textareaClassName?: string;
}

/** The one-textarea form behind both adding an entry and editing one. */
export function WorklogMessageForm({
  initial = '',
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
  autoFocus,
  textareaClassName
}: WorklogMessageFormProps) {
  const { t } = useLingui();
  const [value, setValue] = useState(initial);
  const [isPending, setIsPending] = useState(false);
  const message = value.trim();
  // Saving the text as it was is not an edit.
  const canSubmit = message !== '' && message !== initial && !isPending;

  const submit = async () => {
    if (!canSubmit) return;
    setIsPending(true);
    try {
      await onSubmit(message);
      setValue(initial);
    } catch {
      // The caller's mutation reports the failure; keep the text for a retry.
    } finally {
      setIsPending(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        // Autofocus lands the caret at the start; editing continues at the end.
        onFocus={({ currentTarget }) =>
          currentTarget.setSelectionRange(value.length, value.length)
        }
        className={textareaClassName}
        maxLength={MAX_LENGTH}
        placeholder={placeholder}
        aria-label={t`Message`}
        disabled={isPending}
        autoFocus={autoFocus}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            <Trans>Cancel</Trans>
          </Button>
        )}
        <Button type="submit" size="sm" disabled={!canSubmit}>
          {isPending && <Loader2Icon className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

const fullName = (user: WorklogUser) =>
  [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;

const initials = (user: WorklogUser) =>
  `${user.first_name?.trim().charAt(0) ?? ''}${user.last_name?.trim().charAt(0) ?? ''}`.toUpperCase() ||
  user.email.charAt(0).toUpperCase();

export function WorklogCard({ worklog }: { worklog: Worklog }) {
  const { t, i18n } = useLingui();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const listQuery = worklogsQueryOptions(worklog.property_id);

  const updateMutation = useMutation({
    mutationFn: (message: string) =>
      updateWorklog(worklog.property_id, worklog.id, { message }),
    onSuccess: async () => {
      await queryClient.invalidateQueries(listQuery);
      setIsEditing(false);
    },
    onError: () => {
      toast.error(t`Failed to update entry. Please try again.`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorklog(worklog.property_id, worklog.id),
    onSuccess: async () => {
      setDeleteOpen(false);
      await queryClient.invalidateQueries(listQuery);
      toast.success(t`Entry was deleted`);
    },
    onError: () => {
      toast.error(t`Failed to delete entry. Please try again.`);
    }
  });

  const author = worklog.created_by;
  const editor = worklog.updated_by;
  const authorName = author ? fullName(author) : t`Deleted user`;
  const createdAt = new Date(worklog.created_at);
  const dateTime = new Intl.DateTimeFormat(i18n.locale, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  const editedAt = worklog.updated_at
    ? dateTime.format(new Date(worklog.updated_at))
    : null;
  // Named only when it adds something: an edit by the author goes without.
  const editorName =
    editor && editor.id !== author?.id ? fullName(editor) : null;

  return (
    <>
      <Item
        variant="outline"
        className="flex-col flex-nowrap items-stretch gap-2 p-4"
      >
        <div className="flex min-h-7 items-center gap-2">
          <Avatar size="sm">
            {author?.avatar_url && (
              <AvatarImage src={author.avatar_url} alt="" />
            )}
            <AvatarFallback>{author ? initials(author) : '?'}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
            <span className="truncate text-sm font-medium">{authorName}</span>
            <Tooltip>
              <TooltipTrigger
                render={
                  <time
                    dateTime={worklog.created_at}
                    className="text-xs text-muted-foreground"
                  />
                }
              >
                {new Intl.DateTimeFormat(i18n.locale, {
                  timeStyle: 'short'
                }).format(createdAt)}
              </TooltipTrigger>
              <TooltipContent>
                {new Intl.DateTimeFormat(i18n.locale, {
                  dateStyle: 'full',
                  timeStyle: 'short'
                }).format(createdAt)}
              </TooltipContent>
            </Tooltip>
            {editedAt && (
              <span className="text-xs text-muted-foreground">
                {editorName ? (
                  <Trans>
                    edited {editedAt} by {editorName}
                  </Trans>
                ) : (
                  <Trans>edited {editedAt}</Trans>
                )}
              </span>
            )}
          </div>
          {!isEditing && (
            <DropdownMenu>
              <DataGridRowActions />
              <DropdownMenuContent align="end" className="w-auto min-w-0">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  <Trans>Edit</Trans>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive-soft"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  <Trans>Delete</Trans>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isEditing ? (
          <WorklogMessageForm
            initial={worklog.message}
            submitLabel={<Trans>Update</Trans>}
            onSubmit={updateMutation.mutateAsync}
            onCancel={() => setIsEditing(false)}
            autoFocus
          />
        ) : (
          <p className="text-[13px] wrap-break-word whitespace-pre-wrap">
            {worklog.message}
          </p>
        )}
      </Item>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans>Delete entry?</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>
                This will permanently delete the entry by{' '}
                <span className="font-semibold text-foreground">
                  {authorName}
                </span>
                . This action cannot be undone.
              </Trans>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Trans>Cancel</Trans>
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              <Trans>Delete</Trans>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
