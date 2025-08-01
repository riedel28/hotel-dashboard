import { useState } from 'react';

import { useAuth } from '@/auth';
import { useRouter } from '@tanstack/react-router';
import { Loader2, LogOut } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

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
  onLogoutSuccess?: () => void;
}

export function LogoutDialog({
  open,
  onOpenChange,
  onLogoutSuccess
}: LogoutDialogProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await auth.logout();
      await router.invalidate();
      onLogoutSuccess?.();
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
            <FormattedMessage
              id="auth.logout.confirmTitle"
              defaultMessage="Are you sure you want to logout?"
            />
          </AlertDialogTitle>
          <AlertDialogDescription className="py-4">
            <FormattedMessage
              id="auth.logout.confirmDesc"
              defaultMessage="You will be logged out of your account and redirected to the login page."
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <FormattedMessage id="actions.cancel" defaultMessage="Cancel" />
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            {isLoggingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <LogOut className="mr-2 h-4 w-4" />
            <FormattedMessage id="user.logout" defaultMessage="Log out" />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
