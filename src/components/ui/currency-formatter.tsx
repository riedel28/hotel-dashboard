import { cn } from '@/lib/utils';

interface CurrencyFormatterProps {
  value: number;
  currency?: string;
  locale?: string;
  className?: string;
}

/** An amount of money, in tabular figures so amounts line up in columns. */
export function CurrencyFormatter({
  value,
  currency = 'EUR',
  locale = 'de-DE',
  className
}: CurrencyFormatterProps) {
  const isZero = value === 0;

  return (
    <span className={cn('tabular-nums', className)}>
      {new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: isZero ? 0 : 2,
        maximumFractionDigits: isZero ? 0 : 2
      }).format(value)}
    </span>
  );
}
