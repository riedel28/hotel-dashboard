import dayjs from 'dayjs';

interface DateCellProps {
  isoDate: string;
  format?: string;
  title: string;
}

export function DateCell({
  isoDate,
  title,
  format = 'DD.MM.YYYY'
}: DateCellProps & { title: string }) {
  return (
    <div className="flex gap-1 items-center">
      <span className="text-xs text-muted-foreground">{title}:</span>
      <span className="text-xs ">{dayjs(isoDate).format(format)}</span>
    </div>
  );
}
