import { useLingui } from '@lingui/react/macro';

import { SearchInput } from '@/components/ui/search-input';

interface RoomSearchProps {
  value?: string;
  onChange: (searchTerm: string) => void;
}

export function RoomSearch({ value, onChange }: RoomSearchProps) {
  const { t } = useLingui();

  return (
    <SearchInput
      value={value || ''}
      onChange={onChange}
      placeholder={t`Search rooms`}
      wrapperClassName="w-full sm:w-[250px]"
      debounceMs={500}
    />
  );
}
