import { useIntlLocale } from '@/hooks/use-format-localized';
import { cn } from '@/lib/utils';

interface CurrencyFormatterProps {
  value: number;
  currency?: string;
  className?: string;
}

/**
 * An amount of money in the UI language's notation, in tabular figures so
 * amounts line up in columns.
 */
export function CurrencyFormatter({
  value,
  currency = 'EUR',
  className
}: CurrencyFormatterProps) {
  const locale = useIntlLocale();
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
