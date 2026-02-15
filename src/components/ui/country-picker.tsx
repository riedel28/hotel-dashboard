import { useLingui } from '@lingui/react/macro';
import { SearchIcon } from 'lucide-react';
import { useMemo } from 'react';
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
import { CountryFlag } from '@/components/ui/country-flag';
import {
  type Country,
  getCountries,
  getCountriesByCode
} from '@/lib/countries';
import { cn } from '@/lib/utils';

interface CountryPickerItem {
  value: string;
  label: string;
}

interface CountryPickerProps {
  value?: string;
  onValueChange: (value: string | null) => void;
  codes?: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CountryPicker({
  value,
  onValueChange,
  codes,
  placeholder,
  disabled,
  className
}: CountryPickerProps) {
  const { i18n, t } = useLingui();
  const locale = i18n.locale;

  const countries: Country[] = useMemo(
    () => (codes ? getCountriesByCode(codes, locale) : getCountries(locale)),
    [codes, locale]
  );

  const items: CountryPickerItem[] = useMemo(
    () => countries.map((c) => ({ value: c.code, label: c.name })),
    [countries]
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.value === value) ?? null,
    [items, value]
  );

  const selectedCountry = useMemo(
    () => countries.find((c) => c.code === value),
    [countries, value]
  );

  return (
    <Combobox
      items={items}
      value={selectedItem}
      onValueChange={(val) =>
        onValueChange(
          val && typeof val === 'object' && 'value' in val ? val.value : null
        )
      }
      isItemEqualToValue={(a, b) => a.value === b.value}
      disabled={disabled}
    >
      <ComboboxTrigger
        className={cn(
          'border-input bg-background ring-offset-background flex h-9 w-full items-center justify-between overflow-hidden rounded-md border px-3 py-2 text-sm shadow-xs',
          className
        )}
        aria-label={placeholder ?? t`Select country`}
      >
        <ComboboxValue>
          {selectedCountry ? (
            <span className="flex min-w-0 items-center gap-2">
              <CountryFlag
                code={selectedCountry.code}
                className="size-4"
                aria-label={selectedCountry.code}
              />
              <span className="truncate">{selectedCountry.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              {placeholder ?? t`Select country`}
            </span>
          )}
        </ComboboxValue>
      </ComboboxTrigger>
      <ComboboxContent className="w-72">
        <ComboboxInput
          variant="popup"
          placeholder={t`Search country...`}
          iconLeft={
            <SearchIcon
              className="h-4 w-4 shrink-0 opacity-50"
              aria-hidden="true"
            />
          }
          showTrigger={false}
        />
        <ComboboxEmpty className="py-8 text-center text-sm text-muted-foreground">
          {t`No country found.`}
        </ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              <CountryFlag
                code={item.value}
                className="size-4"
                aria-label={item.value}
              />
              <span>{item.label}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
