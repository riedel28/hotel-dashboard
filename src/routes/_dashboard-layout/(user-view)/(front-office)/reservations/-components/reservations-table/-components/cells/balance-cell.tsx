import { CurrencyFormatter } from '@/components/ui/currency-formatter';

interface BalanceCellProps {
  value: number;
  currency?: string;
}

export function BalanceCell({ value, currency = 'EUR' }: BalanceCellProps) {
  return (
    <div className="text-right">
      <CurrencyFormatter value={value} currency={currency} />
    </div>
  );
}


