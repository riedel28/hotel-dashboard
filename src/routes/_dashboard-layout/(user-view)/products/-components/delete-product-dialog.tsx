// React import not needed; using JSX runtime
import { Trans } from '@lingui/react/macro';

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
            variant="ghost"
            // Soft red, matching the delete item in the actions menus.
            className="border-destructive/20 bg-destructive/10 text-danger hover:bg-destructive/20 hover:text-danger dark:hover:bg-destructive/30"
            onClick={onConfirm}
          >
            <Trans>Delete</Trans>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
