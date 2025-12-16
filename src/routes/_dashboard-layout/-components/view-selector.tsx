import { Trans, useLingui } from '@lingui/react/macro';
import { ChevronsUpDownIcon } from 'lucide-react';
import { useAuth } from '@/auth';
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useView, type ViewType } from '@/contexts/view-context';

export default function ViewSelector() {
  const { t } = useLingui();
  const { currentView, setCurrentView } = useView();
  const { user } = useAuth();

  // Hide view selector if user is not admin
  if (!user?.is_admin) {
    return null;
  }

  const handleValueChange = (value: string | null) => {
    const validView: ViewType | null =
      value === 'user' || value === 'admin' ? value : null;
    if (validView) {
      setCurrentView(validView);
    }
  };

  return (
    <Select value={currentView} onValueChange={handleValueChange}>
      <SelectTrigger
        className="text-foreground border-none shadow-none hover:bg-accent px-3 min-w-[90px]"
        hasIcon={false}
        aria-label={t`Select view`}
      >
        <SelectValue className="capitalize" />
        <SelectIcon>
          <ChevronsUpDownIcon className="size-4 text-muted-foreground" />
        </SelectIcon>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">
          <Trans>User</Trans>
        </SelectItem>
        <SelectItem value="admin">
          <Trans>Admin</Trans>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
