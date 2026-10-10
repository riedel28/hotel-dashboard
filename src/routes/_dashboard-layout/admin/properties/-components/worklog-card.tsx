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
import { Item } from '@/components/ui/item';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { getFullName, getInitials } from '@/utils/user';

import { DeleteWorklogDialog } from './delete-worklog-dialog';
import { WorklogMessageForm } from './worklog-message-form';

// A user without a name goes by their email.
const displayName = (user: WorklogUser) => getFullName(user) || user.email;

export function WorklogCard({ worklog }: { worklog: Worklog }) {
  const { t, i18n } = useLingui();
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
    i18n.date(worklog.updated_at, { dateStyle: 'medium', timeStyle: 'short' });
  // Named only when it adds something: an edit by the author goes without.
  const editorName =
    editor && editor.id !== author?.id ? displayName(editor) : null;

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
            <AvatarFallback>
              {author
                ? getInitials(author) || author.email.charAt(0).toUpperCase()
                : '?'}
            </AvatarFallback>
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
                {i18n.date(worklog.created_at, { timeStyle: 'short' })}
              </TooltipTrigger>
              <TooltipContent>
                {i18n.date(worklog.created_at, {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
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
            message={worklog.message}
            submitLabel={<Trans>Update</Trans>}
            isPending={updateMutation.isPending}
            onSubmit={updateMutation.mutate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <p className="text-[13px] wrap-break-word whitespace-pre-wrap">
            {worklog.message}
          </p>
        )}
      </Item>

      <DeleteWorklogDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        worklog={worklog}
        authorName={authorName}
      />
    </>
  );
}
