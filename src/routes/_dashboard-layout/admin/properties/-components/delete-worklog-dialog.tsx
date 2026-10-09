import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

import {
  deleteWorklog,
  type Worklog,
  worklogsQueryOptions
} from '@/api/worklogs';
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

interface DeleteWorklogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worklog: Worklog;
  authorName: string;
}

export function DeleteWorklogDialog({
  open,
  onOpenChange,
  worklog,
  authorName
}: DeleteWorklogDialogProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorklog(worklog.property_id, worklog.id),
    onSuccess: async () => {
      onOpenChange(false);
      await queryClient.invalidateQueries(
        worklogsQueryOptions(worklog.property_id)
      );
      toast.success(t`Entry was deleted`);
    },
    onError: () => {
      toast.error(t`Failed to delete entry. Please try again.`);
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>Delete entry?</Trans>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Trans>
              This will permanently delete the entry by{' '}
              <span className="font-semibold text-foreground">
                {authorName}
              </span>
              . This action cannot be undone.
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Cancel</Trans>
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2Icon className="animate-spin" />
            )}
            <Trans>Delete</Trans>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
