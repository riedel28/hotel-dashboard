import { FormattedNumber } from 'react-intl';

interface CurrencyFormatterProps {
  value: number;
  currency?: string;
  locale?: string;
  className?: string;
}

export function CurrencyFormatter({
  value,
  currency = 'EUR'
}: CurrencyFormatterProps) {
  return (
    <FormattedNumber
      value={value}
      style="currency"
      currency={currency}
      minimumFractionDigits={value % 1 === 0 ? 0 : 2}
    />
  );
}
