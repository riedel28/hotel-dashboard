import { Trans, useLingui } from '@lingui/react/macro';
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useView, type ViewType } from '@/contexts/view-context';
import { ChevronsUpDownIcon } from 'lucide-react';

export default function ViewSelector() {
  const { t } = useLingui();
  const { currentView, setCurrentView } = useView();

  return (
    <Select
      defaultValue="user"
      value={currentView}
      onValueChange={(value) => setCurrentView(value as ViewType)}
    >
      <SelectTrigger
        className="text-foreground border-none shadow-none hover:bg-accent px-3 min-w-[90px]"
        hasIcon={false}
        aria-label={t`Select view`}
      >
        <SelectValue className="capitalize" />
        <SelectIcon>
          <ChevronsUpDownIcon className="size-4" />
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
