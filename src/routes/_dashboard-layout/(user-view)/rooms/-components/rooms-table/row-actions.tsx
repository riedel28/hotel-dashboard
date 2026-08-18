'use client';

import { Trans } from '@lingui/react/macro';
import { Link as RouterLink } from '@tanstack/react-router';
import { type Row } from '@tanstack/react-table';
import { PenSquareIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';

import type { Room } from '@/api/rooms';
import { DataGridRowActions } from '@/components/ui/data-grid-row-actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

import { DeleteDialog } from './delete-dialog';

interface RowActionsProps {
  row: Row<Room>;
}

export function RowActions({ row }: RowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DataGridRowActions />
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
