import { i18n } from '@lingui/core';
import dayjs from 'dayjs';

type FormatDatePreset = 'date' | 'dateTime' | 'dateTimeWithSeconds' | 'time';

interface FormatDateOptions {
  preset?: FormatDatePreset;
  format?: string;
}

const dateFormats = {
  date: 'DD.MM.YYYY',
  dateTime: 'DD.MM.YYYY HH:mm',
  dateTimeWithSeconds: 'DD.MM.YYYY HH:mm:ss',
  time: 'HH:mm'
} satisfies Record<FormatDatePreset, string>;

export function formatDate(
  date: Date | string | number,
  { preset = 'date', format }: FormatDateOptions
) {
  return dayjs(date).format(format ?? dateFormats[preset]);
}

/**
 * A date written out in the UI language (month and weekday names included),
 * always in European notation: English is formatted the British way, so
 * "12 Oct 2026, 07:57" and never "Oct 12, 2026, 7:57 AM".
 *
 * Use this instead of `i18n.date`, which follows the bare locale (American for
 * English) and is deprecated in Lingui. Call it while rendering, so the text is
 * rebuilt when a language switch re-renders the page.
 */
export function formatLocalized(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions
) {
  const locale = i18n.locale === 'en' ? 'en-GB' : i18n.locale;
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}
