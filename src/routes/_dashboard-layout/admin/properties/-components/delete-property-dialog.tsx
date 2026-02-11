import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { deletePropertyById } from '@/api/properties';

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

interface DeletePropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyName: string;
  propertyId: string;
}

export function DeletePropertyDialog({
  open,
  onOpenChange,
  propertyName,
  propertyId
}: DeletePropertyDialogProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const deletePropertyMutation = useMutation({
    mutationFn: () => deletePropertyById(propertyId),
    onSuccess: async () => {
      onOpenChange(false);

      await queryClient.invalidateQueries({ queryKey: ['properties'] });

      toast.success(t`The property ${propertyName} has been deleted`);
    },
    onError: () => {
      toast.error(t`Error deleting property`);
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>Delete property?</Trans>
          </AlertDialogTitle>
          <AlertDialogDescription className="py-4">
            <Trans>
              The property&nbsp;
              <span className="font-medium text-foreground">
                {propertyName}
              </span>
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
            onClick={() => deletePropertyMutation.mutate()}
            disabled={deletePropertyMutation.isPending}
          >
            {deletePropertyMutation.isPending && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Trans>Delete</Trans>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
