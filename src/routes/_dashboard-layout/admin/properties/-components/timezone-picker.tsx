import { useLingui } from '@lingui/react/macro';
import { SearchIcon } from 'lucide-react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue
} from '@/components/ui/combobox';
import { fieldTriggerClassName } from '@/components/ui/input';

// Every IANA zone the browser knows, e.g. Europe/Berlin.
const zones = Intl.supportedValuesOf('timeZone');

interface TimezonePickerProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
}

export function TimezonePicker({
  id,
  value,
  onValueChange
}: TimezonePickerProps) {
  const { t } = useLingui();

  return (
    <Combobox
      // A stored zone the browser lists under another name still shows.
      items={zones.includes(value) ? zones : [value, ...zones]}
      value={value}
      onValueChange={(zone) => zone && onValueChange(zone)}
    >
      <ComboboxTrigger id={id} className={fieldTriggerClassName}>
        <ComboboxValue>
          <span className="truncate">{value.replaceAll('_', ' ')}</span>
        </ComboboxValue>
      </ComboboxTrigger>
      <ComboboxContent className="w-72">
        <ComboboxInput
          variant="popup"
          placeholder={t`Search timezone...`}
          iconLeft={
            <SearchIcon
              className="h-4 w-4 shrink-0 opacity-50"
              aria-hidden="true"
            />
          }
          showTrigger={false}
        />
        <ComboboxEmpty className="py-8 text-center text-sm text-muted-foreground">
          {t`No timezone found.`}
        </ComboboxEmpty>
        <ComboboxList>
          {(zone: string) => (
            <ComboboxItem key={zone} value={zone}>
              {zone.replaceAll('_', ' ')}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
