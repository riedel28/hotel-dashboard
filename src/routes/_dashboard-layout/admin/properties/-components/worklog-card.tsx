import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  updateWorklog,
  type Worklog,
  worklogsQueryOptions,
  type WorklogUser
} from '@/api/worklogs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataGridRowActions } from '@/components/ui/data-grid-row-actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useFormatLocalized } from '@/hooks/use-format-localized';
import { getFullName, getInitials } from '@/utils/user';

import { DeleteWorklogDialog } from './delete-worklog-dialog';
import { WorklogMessageForm } from './worklog-message-form';

// A user without a name goes by their email.
const displayName = (user: WorklogUser) => getFullName(user) || user.email;

type AvatarUser = Pick<WorklogUser, 'first_name' | 'last_name' | 'email'> & {
  avatar_url?: string | null;
};

/** A small avatar by photo, initials or email; "?" for a deleted user. */
export function WorklogAvatar({ user }: { user: AvatarUser | null }) {
  return (
    <Avatar size="sm">
      {user?.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
      <AvatarFallback>
        {user ? getInitials(user) || user.email.charAt(0).toUpperCase() : '?'}
      </AvatarFallback>
    </Avatar>
  );
}

export function WorklogCard({ worklog }: { worklog: Worklog }) {
  const { t } = useLingui();
  const formatLocalized = useFormatLocalized();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (message: string) =>
      updateWorklog(worklog.property_id, worklog.id, { message }),
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        worklogsQueryOptions(worklog.property_id)
      );
      setIsEditing(false);
    },
    onError: () => {
      toast.error(t`Failed to update entry. Please try again.`);
    }
  });

  const author = worklog.created_by;
  const editor = worklog.updated_by;
  const authorName = author ? displayName(author) : t`Deleted user`;
  const editedAt =
    worklog.updated_at &&
    formatLocalized(worklog.updated_at, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  // Named only when it adds something: an edit by the author goes without.
  const editorName =
    editor && editor.id !== author?.id ? displayName(editor) : null;

  return (
    <>
      {/* Avatar in its own column; the day's timeline line runs down it */}
      <div className="group/entry grid grid-cols-[1.5rem_1fr] gap-x-3 gap-y-1">
        <div className="flex h-7 items-center">
          <WorklogAvatar user={author} />
        </div>
        <div className="flex min-h-7 min-w-0 items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1.5">
            <span className="truncate text-sm font-medium">{authorName}</span>
            <span aria-hidden="true" className="text-xs text-muted-foreground">
              ·
            </span>
            <Tooltip>
              <TooltipTrigger
                render={
                  <time
                    dateTime={worklog.created_at}
                    className="text-xs text-muted-foreground tabular-nums"
                  />
                }
              >
                {formatLocalized(worklog.created_at, { timeStyle: 'short' })}
              </TooltipTrigger>
              <TooltipContent>
                {formatLocalized(worklog.created_at, {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </TooltipContent>
            </Tooltip>
            {editedAt && (
              <>
                <span
                  aria-hidden="true"
                  className="text-xs text-muted-foreground"
                >
                  ·
                </span>
                {/* Just the word; when and by whom in the tooltip */}
                <Tooltip>
                  <TooltipTrigger
                    render={<span className="text-xs text-muted-foreground" />}
                  >
                    <Trans>edited</Trans>
                  </TooltipTrigger>
                  <TooltipContent>
                    {editorName ? (
                      <Trans>
                        Edited {editedAt} by {editorName}
                      </Trans>
                    ) : (
                      <Trans>Edited {editedAt}</Trans>
                    )}
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
          {!isEditing && (
            <DropdownMenu>
              {/* Shown on hover where there is one; always on touch screens */}
              <DataGridRowActions className="focus-visible:opacity-100 aria-expanded:opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover/entry:opacity-100" />
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

        <div className="col-start-2 min-w-0">
          {isEditing ? (
            <WorklogMessageForm
              message={worklog.message}
              submitLabel={<Trans>Update</Trans>}
              isPending={updateMutation.isPending}
              onSubmit={updateMutation.mutate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <p className="text-sm wrap-break-word whitespace-pre-wrap">
              {worklog.message}
            </p>
          )}
        </div>
      </div>

      <DeleteWorklogDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        worklog={worklog}
        authorName={authorName}
      />
    </>
  );
}
