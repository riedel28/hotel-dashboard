// React import not needed; using JSX runtime
import { Trans } from '@lingui/react/macro';
import { Loader2Icon } from 'lucide-react';

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

import { destructiveConfirmClassName } from './destructive-styles';

interface DeleteProductDialogProps {
  open: boolean;
  productTitle: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function DeleteProductDialog({
  open,
  productTitle,
  onOpenChange,
  onConfirm,
  isPending = false
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
          <AlertDialogCancel disabled={isPending}>
            <Trans>Cancel</Trans>
          </AlertDialogCancel>
          <AlertDialogAction
            variant="ghost"
            className={destructiveConfirmClassName}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2Icon className="animate-spin" />}
            <Trans>Delete</Trans>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
