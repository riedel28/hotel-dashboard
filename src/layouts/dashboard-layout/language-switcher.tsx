import ReactCountryFlag from 'react-country-flag';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface LanguageSwitcherProps {
  locale: string;
  setLocale: (l: string) => void;
}

const languages = [
  { code: 'en', label: 'English', country: 'GB' },
  { code: 'de', label: 'Deutsch', country: 'DE' }
];

function LanguageSwitcher({ locale, setLocale }: LanguageSwitcherProps) {
  const lang = languages.find((l) => l.code === locale);
  return (
    <div className="p-2">
      <Select value={locale} onValueChange={setLocale}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {lang && (
              <>
                <ReactCountryFlag
                  countryCode={lang.country}
                  svg
                  className="mr-2 h-4 w-7 rounded-sm align-middle shadow-sm"
                  title={lang.label}
                />
                {lang.label}
              </>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <ReactCountryFlag
                countryCode={lang.country}
                svg
                className="mr-2 h-4 w-7 rounded-sm align-middle shadow-sm"
                title={lang.label}
              />
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default LanguageSwitcher;
