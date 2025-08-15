// React import not needed; using JSX runtime
import { Trans } from '@lingui/react/macro';
import { Trash } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface DeleteProductDialogProps {
  open: boolean;
  productTitle: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteProductDialog({
  open,
  productTitle,
  onOpenChange,
  onConfirm
}: DeleteProductDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>Delete product?</Trans>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Trans>
              Are you sure you want to delete&nbsp;
              <span className="font-medium text-foreground">
                {productTitle}
              </span>
              ? This action cannot be undone.
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Cancel</Trans>
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            <Trash className="mr-2 h-4 w-4" />
            <Trans>Delete</Trans>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
