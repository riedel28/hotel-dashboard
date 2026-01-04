'use client';

import { Trans, useLingui } from '@lingui/react/macro';
import { Link as RouterLink } from '@tanstack/react-router';
import { type Row } from '@tanstack/react-table';
import {
  MessageSquareDot,
  MoreHorizontal,
  PenSquare,
  Trash
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import type { Reservation } from '@/api/reservations';

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
  row: Row<Reservation>;
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
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">
            <Trans>Open menu</Trans>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem
            onClick={() => {
              toast.info(t`Pushed to device`);
            }}
          >
            <MessageSquareDot className="mr-2 h-4 w-4" />
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
                <PenSquare className="mr-2 h-4 w-4" />
                <Trans>Edit</Trans>
              </RouterLink>
            )}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
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
