import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import { type Row } from '@tanstack/react-table';
import { MailIcon, PencilIcon, TrashIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { isDemoForbidden } from '@/api/client';
import { resendInvitation, type User } from '@/api/users';
import { type DataGridFeatures } from '@/components/ui/data-grid';
import { DataGridRowActions } from '@/components/ui/data-grid-row-actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

import { DeleteDialog } from './delete-dialog';

interface RowActionsProps {
  row: Row<DataGridFeatures, User>;
  /** Opens the user in the drawer. */
  onEdit?: (userId: number) => void;
}

export function RowActions({ row, onEdit }: RowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const resendMutation = useMutation({
    mutationFn: () => resendInvitation(row.original.id),
    onSuccess: () => {
      toast.success(t`Invitation resent successfully`);
    },
    onError: (error) => {
      toast.error(
        isDemoForbidden(error) ? error.message : t`Failed to resend invitation`
      );
    }
  });

  return (
    <>
      <DropdownMenu>
        <DataGridRowActions />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit?.(row.original.id)}>
            <PencilIcon />
            <Trans>Edit user</Trans>
          </DropdownMenuItem>
          {!row.original.email_verified && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
              >
                <MailIcon />
                <Trans>Resend invitation</Trans>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive-soft"
            onClick={() => setShowDeleteDialog(true)}
          >
            <TrashIcon />
            <Trans>Delete</Trans>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        userName={
          [row.original.first_name, row.original.last_name]
            .filter(Boolean)
            .join(' ') || row.original.email
        }
        userId={row.original.id}
      />
    </>
  );
}
