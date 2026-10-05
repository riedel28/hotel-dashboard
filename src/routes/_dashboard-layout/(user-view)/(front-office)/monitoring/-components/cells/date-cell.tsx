import dayjs from 'dayjs';

interface DateCellProps {
  date: Date | string;
}

export function DateCell({ date }: DateCellProps) {
  return (
    <div className="flex flex-row items-center gap-1.5">
      <span className="text-[13px] text-muted-foreground">
        {dayjs(date).format('DD.MM.YYYY')}
      </span>
      <span className="text-[13px] text-muted-foreground">
        {dayjs(date).format('HH:mm:ss')}
      </span>
    </div>
  );
}
