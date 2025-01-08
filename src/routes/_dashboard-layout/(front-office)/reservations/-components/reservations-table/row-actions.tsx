'use client';

import * as React from 'react';

import { Link as RouterLink } from '@tanstack/react-router';
import { Row } from '@tanstack/react-table';
import {
  MessageSquareDot,
  MoreHorizontal,
  PenSquare,
  Trash
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { Reservation } from './columns.tsx';
import { DeleteDialog } from './delete-dialog';
import { ShareDialog } from './share-dialog';

interface RowActionsProps {
  row: Row<Reservation>;
}

export function RowActions({ row }: RowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem>
            <MessageSquareDot className="mr-2 h-4 w-4" />
            Push to device
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <RouterLink
              to="/front-office/reservations/$reservationId"
              params={{
                reservationId: String(row.original.id)
              }}
            >
              <PenSquare className="mr-2 h-4 w-4" />
              Edit
            </RouterLink>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MessageSquareDot className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        reservationNr={row.original.booking_nr}
        reservationId={row.original.id}
      />
      <ShareDialog
        open={showShareModal}
        onOpenChange={setShowShareModal}
        reservation={row.original}
      />
    </>
  );
}
