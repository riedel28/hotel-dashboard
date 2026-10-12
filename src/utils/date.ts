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
