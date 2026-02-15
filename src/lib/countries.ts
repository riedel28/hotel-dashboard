import countries from 'i18n-iso-countries';
import de from 'i18n-iso-countries/langs/de.json';
import en from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(en);
countries.registerLocale(de);

export interface Country {
  code: string;
  name: string;
}

export function getCountryName(code: string, locale: string): string {
  return countries.getName(code, locale) ?? code;
}

export function getCountries(locale: string): Country[] {
  const names = countries.getNames(locale);
  return Object.entries(names)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

export function getCountriesByCode(codes: string[], locale: string): Country[] {
  return codes
    .map((code) => ({ code, name: getCountryName(code, locale) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}
