import { Trans } from '@lingui/react/macro';
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
  room: Room;
  onEdit: (roomId: number) => void;
}

export function RowActions({ room, onEdit }: RowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DataGridRowActions />
        <DropdownMenuContent align="end" className="w-auto min-w-40">
          <DropdownMenuItem onClick={() => onEdit(room.id)}>
            <PenSquareIcon className="mr-2 h-4 w-4" />
            <Trans>Edit</Trans>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive-soft"
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
        room={room}
      />
    </>
  );
}
