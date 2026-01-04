import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { deleteRoomById } from '@/api/rooms';

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

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomName: string;
  roomId: number;
}

async function deleteRoom(roomId: number) {
  return deleteRoomById(String(roomId));
}

export function DeleteDialog({
  open,
  onOpenChange,
  roomName,
  roomId
}: DeleteDialogProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteRoomMutation = useMutation({
    mutationFn: () => deleteRoom(roomId),
    onSuccess: async () => {
      // First close the modal
      onOpenChange(false);

      // Then update the table and show success message after the update
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });

      // Navigate back to rooms list
      navigate({ to: '/rooms' });

      toast.success(t`The room ${roomName} has been deleted`);
    },
    onError: () => {
      toast.error(t`Error deleting room`);
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>Are you sure?</Trans>
          </AlertDialogTitle>
          <AlertDialogDescription className="py-4">
            <Trans>
              The room&nbsp;
              <span className="font-medium text-foreground">{roomName}</span>
              &nbsp;will be deleted. This action cannot be undone.
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Cancel</Trans>
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => deleteRoomMutation.mutate()}
            disabled={deleteRoomMutation.isPending}
          >
            {deleteRoomMutation.isPending && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Trans>Delete</Trans>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

