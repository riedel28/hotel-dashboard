'use client';

import { Trans, useLingui } from '@lingui/react/macro';
import { Link as RouterLink } from '@tanstack/react-router';
import { MessageSquareDotIcon, PencilIcon, TrashIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import type { Reservation } from '@/api/reservations';
import { DataGridRowActions } from '@/components/ui/data-grid-row-actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

import { DeleteDialog } from './delete-dialog';

interface RowActionsProps {
  reservation: Reservation;
  /** The trigger's size: 24px keeps a table row as low as its text cells. */
  className?: string;
}

export function RowActions({
  reservation,
  className = 'size-6'
}: RowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const { t } = useLingui();

  return (
    <>
      <DropdownMenu>
        <DataGridRowActions className={className} />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              toast.info(t`Pushed to device`);
            }}
          >
            <MessageSquareDotIcon />
            <Trans>Push to device</Trans>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={(props) => (
              <RouterLink
                {...props}
                to="/reservations/$reservationId"
                params={{
                  reservationId: String(reservation.id)
                }}
                preload="intent"
              >
                <PencilIcon />
                <Trans>Edit Reservation</Trans>
              </RouterLink>
            )}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive-soft"
            onClick={() => setShowDeleteDialog(true)}
          >
            <TrashIcon />
            <Trans>Delete Reservation</Trans>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        reservation={reservation}
      />
    </>
  );
}
