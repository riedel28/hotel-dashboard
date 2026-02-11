import { useLingui } from '@lingui/react/macro';

import { SearchInput } from '@/components/ui/search-input';

interface PropertySearchProps {
  value?: string;
  onChange: (searchTerm: string) => void;
}

export function PropertySearch({ value, onChange }: PropertySearchProps) {
  const { t } = useLingui();

  return (
    <SearchInput
      value={value || ''}
      onChange={onChange}
      placeholder={t`Search properties`}
      wrapperClassName="w-full sm:w-[250px]"
      debounceMs={500}
    />
  );
}
