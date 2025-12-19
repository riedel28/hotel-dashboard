import dayjs from 'dayjs';

interface DateCellProps {
  date: Date | string;
}

export function DateCell({ date }: DateCellProps) {
  return (
    <div className="flex flex-col">
      <span>{dayjs(date).format('DD.MM.YYYY')}</span>
      <span className="text-xs text-muted-foreground">
        {dayjs(date).format('HH:mm:ss')}
      </span>
    </div>
  );
}

