import { useView } from '@/contexts/view-context';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function ViewSelector() {
  const intl = useIntl();
  const { currentView, setCurrentView } = useView();

  return (
    <Select value={currentView} onValueChange={setCurrentView}>
      <SelectTrigger
        aria-label={intl.formatMessage({
          id: 'header.userView.selectView',
          defaultMessage: 'Select view'
        })}
        className="hover:bg-accent data-[state=open]:bg-accent text-secondary-foreground border-none bg-transparent text-sm font-medium shadow-none focus-visible:ring-0"
      >
        <SelectValue
          placeholder={intl.formatMessage({
            id: 'header.userView.selectView',
            defaultMessage: 'Select view'
          })}
        />
      </SelectTrigger>
      <SelectContent className="w-[150px] [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
        <SelectItem value="user">
          <FormattedMessage id="header.userView.user" defaultMessage="User" />
        </SelectItem>
        <SelectItem value="admin">
          <FormattedMessage id="header.userView.admin" defaultMessage="Admin" />
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
