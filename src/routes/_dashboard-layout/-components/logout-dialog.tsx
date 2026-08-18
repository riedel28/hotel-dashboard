import { Trans } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, LogOutIcon } from 'lucide-react';
import { useState } from 'react';

import { useAuth } from '@/auth';
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

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogoutSuccess?: () => Promise<void> | void;
}

export function LogoutDialog({
  open,
  onOpenChange,
  onLogoutSuccess
}: LogoutDialogProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const queryClient = useQueryClient();
  const auth = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await auth.logout();
      await onLogoutSuccess?.();
      queryClient.clear();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>Are you sure you want to logout?</Trans>
          </AlertDialogTitle>
          <AlertDialogDescription className="py-4">
            <Trans>
              You will be logged out of your account and redirected to the login
              page.
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Cancel</Trans>
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            {isLoggingOut && (
              <Loader2Icon className="mr-1 size-4 animate-spin" />
            )}
            <LogOutIcon className="mr-1 size-4" />
            <Trans>Log out</Trans>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
