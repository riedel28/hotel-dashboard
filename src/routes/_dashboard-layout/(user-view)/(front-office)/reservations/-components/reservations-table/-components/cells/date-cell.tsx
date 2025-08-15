import dayjs from 'dayjs';

interface DateCellProps {
  isoDate: string;
  format?: string;
}

export function DateCell({ isoDate, format = 'DD.MM.YYYY' }: DateCellProps) {
  return <span>{dayjs(isoDate).format(format)}</span>;
}
