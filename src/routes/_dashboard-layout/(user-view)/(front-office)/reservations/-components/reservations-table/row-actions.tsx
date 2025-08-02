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
import { FormattedMessage } from 'react-intl';

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
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">
              <FormattedMessage
                id="reservations.openMenu"
                defaultMessage="Open menu"
              />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem>
            <MessageSquareDot className="mr-2 h-4 w-4" />
            <FormattedMessage
              id="reservations.pushToDevice"
              defaultMessage="Push to device"
            />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <RouterLink
              to="/reservations/$reservationId"
              params={{
                reservationId: String(row.original.id)
              }}
            >
              <PenSquare className="mr-2 h-4 w-4" />
              <FormattedMessage id="actions.edit" defaultMessage="Edit" />
            </RouterLink>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MessageSquareDot className="mr-2 h-4 w-4" />
            <FormattedMessage id="actions.share" defaultMessage="Share" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            <FormattedMessage id="actions.delete" defaultMessage="Delete" />
            {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
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
