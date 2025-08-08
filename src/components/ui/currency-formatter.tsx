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
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: value === 0 ? 0 : 2
  }).format(value);
}
