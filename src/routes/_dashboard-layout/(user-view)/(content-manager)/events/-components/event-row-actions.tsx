import { Trans } from '@lingui/react/macro';
import { Link as RouterLink } from '@tanstack/react-router';
import { CopyIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

import type { HotelEvent } from '@/api/events';
import { DataGridRowActions } from '@/components/ui/data-grid-row-actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

import { DeleteEventDialog } from './delete-event-dialog';

export function EventRowActions({ event }: { event: HotelEvent }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const eventId = event.id;

  return (
    <>
      <DropdownMenu>
        {/* 24px keeps the row as low as its text cells allow */}
        <DataGridRowActions className="size-6" />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={(props) => (
              <RouterLink
                {...props}
                to="/events/$eventId"
                params={{ eventId }}
                preload="intent"
              >
                <PencilIcon />
                <Trans>Edit</Trans>
              </RouterLink>
            )}
          />
          <DropdownMenuItem
            render={(props) => (
              <RouterLink
                {...props}
                to="/events/new"
                search={{ duplicate: event.id }}
              >
                <CopyIcon />
                <Trans>Duplicate</Trans>
              </RouterLink>
            )}
          />
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
      <DeleteEventDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        event={event}
      />
    </>
  );
}
