import { useLingui } from '@lingui/react';

/**
 * The UI language as an Intl locale, in European notation: English is written
 * the British way, so "12 Oct 2026, 07:57" and "€1,250.50".
 */
export function useIntlLocale() {
  const { i18n } = useLingui();
  return i18n.locale === 'en' ? 'en-GB' : i18n.locale;
}

/**
 * Formats a date in the UI language (month and weekday names included), always
 * in European notation: English is written the British way, so
 * "12 Oct 2026, 07:57" and never "Oct 12, 2026, 7:57 AM".
 *
 * Use this instead of `i18n.date`, which follows the bare locale (American for
 * English) and is deprecated in Lingui. For fixed numeric formats such as
 * `DD.MM.YYYY` there is `formatDate` in `@/utils/date`.
 */
export function useFormatLocalized() {
  const locale = useIntlLocale();

  return (date: Date | string | number, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, options).format(new Date(date));
}
