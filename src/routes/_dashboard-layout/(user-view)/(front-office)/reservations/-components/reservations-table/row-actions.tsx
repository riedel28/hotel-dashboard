'use client';

import { Trans, useLingui } from '@lingui/react/macro';
import { Link as RouterLink } from '@tanstack/react-router';
import { type Row } from '@tanstack/react-table';
import { MessageSquareDot, PenSquare, Trash } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import type { Reservation } from '@/api/reservations';
import { DataGridRowActions } from '@/components/ui/data-grid-row-actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu';

import { DeleteDialog } from './delete-dialog';

interface RowActionsProps {
  row: Row<Reservation>;
}

export function RowActions({ row }: RowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const { t } = useLingui();

  return (
    <>
      <DropdownMenu>
        <DataGridRowActions />
        <DropdownMenuContent align="end" className="w-auto min-w-40">
          <DropdownMenuItem
            onClick={() => {
              toast.info(t`Pushed to device`);
            }}
          >
            <MessageSquareDot className="mr-1 h-4 w-4" />
            <Trans>Push to device</Trans>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={(props) => (
              <RouterLink
                {...props}
                to="/reservations/$reservationId"
                params={{
                  reservationId: String(row.original.id)
                }}
                preload="intent"
              >
                <PenSquare className="mr-1 h-4 w-4" />
                <Trans>Edit</Trans>
              </RouterLink>
            )}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-1 h-4 w-4" />
            <Trans>Delete</Trans>
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
    </>
  );
}
