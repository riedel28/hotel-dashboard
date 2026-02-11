import { Trans } from '@lingui/react/macro';
import Flag from 'react-flagkit';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const countries = [
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DE', name: 'Germany' },
  { code: 'ES', name: 'Spain' },
  { code: 'US', name: 'United States' }
] as const;

interface PropertyCountryFilterProps {
  value?: string;
  onChange: (countryCode: string | null) => void;
}

export function PropertyCountryFilter({
  value,
  onChange
}: PropertyCountryFilterProps) {
  return (
    <Select value={value ?? 'all'} onValueChange={onChange} defaultValue="all">
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue>
          {(val) => {
            if (!val || val === 'all') {
              return (
                <span>
                  <Trans>All countries</Trans>
                </span>
              );
            }
            const country = countries.find((c) => c.code === val);
            if (!country) return <span>{val}</span>;
            return (
              <span className="flex items-center gap-2">
                <Flag
                  country={country.code}
                  className="size-3.5 rounded-sm"
                  aria-label={country.code}
                />
                <span>{country.name}</span>
              </span>
            );
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value="all">
          <span className="flex items-center gap-2">
            <span className="size-3.5" />
            <span>
              <Trans>All countries</Trans>
            </span>
          </span>
        </SelectItem>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <span className="flex items-center gap-2">
              <Flag
                country={country.code}
                className="size-3.5 rounded-sm"
                aria-label={country.code}
              />
              <span>{country.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
