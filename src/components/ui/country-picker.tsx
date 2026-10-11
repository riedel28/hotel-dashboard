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
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
  'aria-labelledby'?: string;
}

export function CountryPicker({
  value,
  onValueChange,
  codes,
  placeholder,
  disabled,
  className,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  'aria-labelledby': ariaLabelledby
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
          // Base — mirrors <Input>
          'flex h-9 w-full items-center justify-between gap-2 overflow-hidden rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none dark:bg-input/30',
          // Focus, also while its popup is open
          'focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)] data-popup-open:border-primary data-popup-open:shadow-[inset_0_0_0_1px_var(--color-primary)]',
          // Error / invalid — from aria-invalid or an enclosing <Field data-invalid>
          'aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:shadow-[inset_0_0_0_1px_var(--color-danger)] aria-invalid:data-popup-open:border-danger aria-invalid:data-popup-open:shadow-[inset_0_0_0_1px_var(--color-danger)]',
          'in-data-[invalid=true]:border-danger in-data-[invalid=true]:focus-visible:border-danger in-data-[invalid=true]:focus-visible:shadow-[inset_0_0_0_1px_var(--color-danger)] in-data-[invalid=true]:data-popup-open:border-danger in-data-[invalid=true]:data-popup-open:shadow-[inset_0_0_0_1px_var(--color-danger)]',
          // Disabled
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:disabled:bg-input/80',
          className
        )}
        aria-label={
          ariaLabelledby ? undefined : (placeholder ?? t`Select country`)
        }
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid}
        aria-labelledby={ariaLabelledby}
      >
        <ComboboxValue>
          {selectedCountry ? (
            <span className="flex min-w-0 items-center gap-2">
              <CountryFlag
                code={selectedCountry.code}
                title={selectedCountry.name}
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
