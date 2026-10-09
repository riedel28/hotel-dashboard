import { useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { customerLabel } from 'shared/types/customers';
import type { PropertyCustomer } from 'shared/types/properties';

import { customersQueryOptions } from '@/api/customers';
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
import { useDebounce } from '@/hooks/use-debounce';

// Search results also carry an email, which tells apart two Customers with
// the same name; the Customer already on a Property does not.
type PickerCustomer = PropertyCustomer & { email?: string };

interface CustomerPickerProps {
  value: PropertyCustomer | null;
  onValueChange: (customer: PropertyCustomer | null) => void;
  'aria-labelledby': string;
}

/** Picks the Customer that owns a Property, searching them on the server. */
export function CustomerPicker({
  value,
  onValueChange,
  'aria-labelledby': ariaLabelledby
}: CustomerPickerProps) {
  const { t } = useLingui();
  const [search, setSearch] = useState('');
  const q = useDebounce(search.trim(), 300);

  const { data, isPending } = useQuery(
    customersQueryOptions({ q: q || undefined, per_page: 10, sort_by: 'name' })
  );
  const items: PickerCustomer[] = data?.index ?? [];

  return (
    <Combobox
      items={items}
      // The server has already filtered them.
      filter={null}
      value={value}
      onValueChange={(customer: PickerCustomer | null) =>
        onValueChange(
          customer && {
            id: customer.id,
            first_name: customer.first_name,
            last_name: customer.last_name,
            company_name: customer.company_name
          }
        )
      }
      inputValue={search}
      onInputValueChange={setSearch}
      onOpenChange={(open) => {
        if (!open) setSearch('');
      }}
      itemToStringLabel={(customer: PickerCustomer) => customerLabel(customer)}
      isItemEqualToValue={(a, b) => a.id === b.id}
    >
      <ComboboxTrigger
        className="flex h-9 items-center justify-between overflow-hidden rounded-lg border border-input px-3 py-2 text-sm ring-offset-background dark:bg-input/30"
        aria-labelledby={ariaLabelledby}
        showClear
        clearLabel={t`Remove customer`}
      >
        <ComboboxValue>
          {value ? (
            <span className="truncate">{customerLabel(value)}</span>
          ) : (
            <span className="text-muted-foreground">{t`No customer`}</span>
          )}
        </ComboboxValue>
      </ComboboxTrigger>
      <ComboboxContent className="w-80">
        <ComboboxInput
          variant="popup"
          placeholder={t`Search customers`}
          iconLeft={
            <SearchIcon
              className="h-4 w-4 shrink-0 opacity-50"
              aria-hidden="true"
            />
          }
          showTrigger={false}
        />
        <ComboboxEmpty className="py-8 text-center text-sm text-muted-foreground">
          {isPending ? t`Searching...` : t`No customer found.`}
        </ComboboxEmpty>
        <ComboboxList>
          {(customer: PickerCustomer) => (
            <ComboboxItem key={customer.id} value={customer}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{customerLabel(customer)}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {[
                    customer.company_name &&
                      `${customer.first_name} ${customer.last_name}`,
                    customer.email
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
