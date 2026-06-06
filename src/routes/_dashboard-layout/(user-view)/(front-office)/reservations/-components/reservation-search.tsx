import { useLingui } from '@lingui/react/macro';

import { SearchInput } from '@/components/ui/search-input';

interface ReservationSearchProps {
  value?: string;
  onChange: (searchTerm: string) => void;
}

export function ReservationSearch({ value, onChange }: ReservationSearchProps) {
  const { t } = useLingui();

  return (
    <SearchInput
      value={value || ''}
      onChange={onChange}
      placeholder={t`Search reservations`}
      className="text-sm"
      wrapperClassName="w-full lg:w-[250px]"
      debounceMs={500}
    />
  );
}
