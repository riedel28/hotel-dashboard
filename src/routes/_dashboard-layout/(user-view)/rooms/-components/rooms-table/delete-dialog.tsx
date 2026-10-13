import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { ApiError } from '@/api/client';
import { deleteRoomById, type Room } from '@/api/rooms';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { roomLabel } from '@/lib/rooms';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
}

export function DeleteDialog({ open, onOpenChange, room }: DeleteDialogProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const label = roomLabel(room);
  const isBlocked = room.has_active_reservation;

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['rooms'] }),
      // The room picker lists the rooms too
      queryClient.invalidateQueries({ queryKey: ['devices', 'room-options'] })
    ]);

  const deleteRoomMutation = useMutation({
    mutationFn: () => deleteRoomById(room.id),
    onSuccess: async () => {
      onOpenChange(false);
      await refresh();
      toast.success(t`The room ${label} has been deleted`);
    },
    onError: (error) => {
      // A reservation made since the list was loaded: the refreshed row
      // turns this dialog into its blocked state
      if (
        error instanceof ApiError &&
        error.code === 'ROOM_HAS_ACTIVE_RESERVATION'
      ) {
        toast.error(
          t`The room ${label} has an active reservation and cannot be deleted`
        );
        return refresh();
      }
      toast.error(t`Error deleting room`);
    }
  });

  const deleteButton = (
    <Button
      variant="destructive"
      onClick={() => deleteRoomMutation.mutate()}
      disabled={isBlocked || deleteRoomMutation.isPending}
    >
      {deleteRoomMutation.isPending && (
        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
      )}
      <Trans>Delete</Trans>
    </Button>
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBlocked ? (
              <Trans>This room cannot be deleted</Trans>
            ) : (
              <Trans>Are you sure?</Trans>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription className="py-4">
            {isBlocked ? (
              <Trans>
                The room&nbsp;
                <span className="font-medium text-foreground">{label}</span>
                &nbsp;has an active reservation. It can be deleted once the
                guest has checked out or the reservation is moved to another
                room.
              </Trans>
            ) : (
              <Trans>
                The room&nbsp;
                <span className="font-medium text-foreground">{label}</span>
                &nbsp;will be deleted. This action cannot be undone.
              </Trans>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Cancel</Trans>
          </AlertDialogCancel>
          {isBlocked ? (
            <Tooltip>
              {/* A disabled button fires no pointer events of its own */}
              <TooltipTrigger render={<span tabIndex={0} />}>
                {deleteButton}
              </TooltipTrigger>
              <TooltipContent>
                <Trans>The room has an active reservation</Trans>
              </TooltipContent>
            </Tooltip>
          ) : (
            deleteButton
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
