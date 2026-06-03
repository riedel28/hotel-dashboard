import dayjs from 'dayjs';

interface DateCellProps {
  isoDate: string;
  format?: string;
}

export function DateCell({ isoDate, format = 'DD.MM.YYYY' }: DateCellProps) {
  return (
    <span className="text-sm text-muted-foreground">
      {dayjs(isoDate).format(format)}
    </span>
  );
}
