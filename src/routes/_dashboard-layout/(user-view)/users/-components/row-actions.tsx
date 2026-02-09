import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import { Link as RouterLink } from '@tanstack/react-router';
import { type Row } from '@tanstack/react-table';
import {
  MailIcon,
  MoreHorizontalIcon,
  PenSquareIcon,
  TrashIcon
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { resendInvitation, type User } from '@/api/users';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { DeleteDialog } from './delete-dialog';

interface RowActionsProps {
  row: Row<User>;
}

export function RowActions({ row }: RowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const resendMutation = useMutation({
    mutationFn: () => resendInvitation(row.original.id),
    onSuccess: () => {
      toast.success(t`Invitation resent successfully`);
    },
    onError: () => {
      toast.error(t`Failed to resend invitation`);
    }
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          )}
        >
          <MoreHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">
            <Trans>Open menu</Trans>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem
            render={(props) => (
              <RouterLink
                {...props}
                to="/users/$userId"
                params={{
                  userId: String(row.original.id)
                }}
                search={{}}
                replace
              >
                <PenSquareIcon className="mr-2 h-4 w-4" />
                <Trans>Edit</Trans>
              </RouterLink>
            )}
          />
          {!row.original.email_verified && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
              >
                <MailIcon className="mr-2 h-4 w-4" />
                <Trans>Resend invitation</Trans>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            <Trans>Delete</Trans>
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
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
