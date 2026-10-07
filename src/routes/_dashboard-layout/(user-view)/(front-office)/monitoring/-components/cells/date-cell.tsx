import dayjs from 'dayjs';

interface DateCellProps {
  date: Date | string;
}

export function DateCell({ date }: DateCellProps) {
  const value = dayjs(date);
  const isCurrentYear = value.year() === dayjs().year();

  return (
    <time
      dateTime={value.toISOString()}
      title={value.format('DD.MM.YYYY HH:mm:ss [UTC]Z')}
      className="text-[13px] text-muted-foreground tabular-nums"
    >
      {value.format(isCurrentYear ? 'DD.MM HH:mm:ss' : 'DD.MM.YYYY HH:mm:ss')}
    </time>
  );
}
