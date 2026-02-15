import { useLingui } from '@lingui/react/macro';

import { CountryPicker } from '@/components/ui/country-picker';

interface PropertyCountryFilterProps {
  value?: string;
  onChange: (countryCode: string | null) => void;
}

export function PropertyCountryFilter({
  value,
  onChange
}: PropertyCountryFilterProps) {
  const { t } = useLingui();

  return (
    <CountryPicker
      value={value}
      onValueChange={onChange}
      placeholder={t`All countries`}
      className="w-full sm:w-[180px]"
    />
  );
}
