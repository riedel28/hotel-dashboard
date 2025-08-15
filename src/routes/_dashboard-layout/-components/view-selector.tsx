import { useView } from '@/contexts/view-context';
import { Trans, useLingui } from '@lingui/react/macro';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function ViewSelector() {
  const { t } = useLingui();
  const { currentView, setCurrentView } = useView();

  return (
    <Select value={currentView} onValueChange={setCurrentView}>
      <SelectTrigger
        aria-label={t`Select view`}
        className="border-none bg-transparent text-sm font-medium text-secondary-foreground shadow-none hover:bg-accent focus-visible:ring-0 data-[state=open]:bg-accent"
      >
        <SelectValue placeholder={t`Select view`} />
      </SelectTrigger>
      <SelectContent className="w-[150px] [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
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
