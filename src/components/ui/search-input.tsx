import { useId } from 'react';

import { Search } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SearchInput() {
  const id = useId();
  const intl = useIntl();

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="sr-only">
        <FormattedMessage
          id="searchInput.label"
          defaultMessage="Search input with icon and button"
        />
      </Label>
      <div className="relative">
        <Input
          id={id}
          className="peer ps-9 pe-9"
          placeholder={intl.formatMessage({
            id: 'placeholders.search',
            defaultMessage: 'Search...'
          })}
          type="search"
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <Search size={16} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
