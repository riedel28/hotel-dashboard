'use client';

import { Trans, useLingui } from '@lingui/react/macro';
import { Link as RouterLink } from '@tanstack/react-router';
import { type Row } from '@tanstack/react-table';
import { MoreHorizontalIcon, PenSquareIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';
import type { Room } from '@/api/rooms';

import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { DeleteDialog } from './delete-dialog';

interface RowActionsProps {
  row: Row<Room>;
}

export function RowActions({ row }: RowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const { t } = useLingui();

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
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem
            render={(props) => (
              <RouterLink
                {...props}
                to="/rooms/$roomId"
                params={{
                  roomId: String(row.original.id)
                }}
                preload="intent"
              >
                <PenSquareIcon className="mr-2 h-4 w-4" />
                <Trans>Edit</Trans>
              </RouterLink>
            )}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            <Trans>Delete</Trans>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        roomName={row.original.name}
        roomId={row.original.id}
      />
    </>
  );
}

