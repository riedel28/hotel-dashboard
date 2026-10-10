import { CurrencyFormatter } from '@/components/ui/currency-formatter';
import { cn } from '@/lib/utils';

interface BalanceCellProps {
  value: number;
  currency?: string;
}

export function BalanceCell({ value, currency = 'EUR' }: BalanceCellProps) {
  return (
    <div className={cn('text-right tabular-nums', value < 0 && 'text-danger')}>
      <CurrencyFormatter value={value} currency={currency} />
    </div>
  );
}
