import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { Loader2Icon, SearchIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { Guest } from 'shared/types/reservations';

import { guestSearchQueryOptions } from '@/api/reservations';
import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup
} from '@/components/ui/autocomplete';
import { useDebouncedCallback } from '@/hooks';

interface GuestSearchComboboxProps {
  currentGuests: Guest[];
  onSelectGuest: (guest: Guest) => void;
}

interface GuestOption {
  label: string;
  value: string;
  first_name: string;
  last_name: string;
  email: string | null;
  nationality_code: string;
}

export function GuestSearchCombobox({
  currentGuests,
  onSelectGuest
}: GuestSearchComboboxProps) {
  const [inputValue, setInputValue] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  const debouncedSetTerm = useDebouncedCallback(
    useCallback((value: string) => setDebouncedTerm(value), []),
    300
  );

  const { data: results = [], isFetching } = useQuery(
    guestSearchQueryOptions(debouncedTerm)
  );

  // Map results to autocomplete items, filtering out already-added guests
  const items = useMemo<GuestOption[]>(
    () =>
      results
        .filter(
          (result) =>
            !currentGuests.some(
              (g) =>
                g.first_name === result.first_name &&
                g.last_name === result.last_name &&
                g.nationality_code === result.nationality_code
            )
        )
        .map((result) => ({
          label: `${result.first_name} ${result.last_name}`,
          value: `${result.first_name}|${result.last_name}|${result.nationality_code}`,
          first_name: result.first_name,
          last_name: result.last_name,
          email: result.email ?? null,
          nationality_code: result.nationality_code
        })),
    [results, currentGuests]
  );

  const handleValueChange = (
    value: string,
    eventDetails: { reason: string }
  ) => {
    if (eventDetails.reason === 'item-press') {
      const selected = items.find((item) => item.label === value);
      if (selected) {
        const newGuest: Guest = {
          id: Date.now(),
          reservation_id: 0,
          first_name: selected.first_name,
          last_name: selected.last_name,
          email: selected.email,
          nationality_code: selected.nationality_code,
          created_at: new Date(),
          updated_at: null
        };
        onSelectGuest(newGuest);
      }
      setInputValue('');
      setDebouncedTerm('');
      return;
    }

    setInputValue(value);
    debouncedSetTerm(value.trim());
  };

  return (
    <Autocomplete
      value={inputValue}
      onValueChange={handleValueChange}
      mode="none"
      items={items}
    >
      <AutocompleteInput
        aria-label={t`Search for a guest`}
        placeholder={t`Search for a guest...`}
        startAddon={
          isFetching ? (
            <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
          )
        }
      />
      <AutocompletePopup>
        <AutocompleteEmpty>
          <Trans>No guests found</Trans>
        </AutocompleteEmpty>
        <AutocompleteList>
          {(item: GuestOption) => (
            <AutocompleteItem key={item.value} value={item}>
              <div className="flex flex-col">
                <span>{item.label}</span>
                {item.email && (
                  <span className="text-xs text-muted-foreground">
                    {item.email}
                  </span>
                )}
              </div>
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompletePopup>
    </Autocomplete>
  );
}
