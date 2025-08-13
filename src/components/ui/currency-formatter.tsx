interface CurrencyFormatterProps {
  value: number;
  currency?: string;
  locale?: string;
  className?: string;
}

export function CurrencyFormatter({
  value,
  currency = 'EUR',
  locale = 'de-DE'
}: CurrencyFormatterProps) {
  const isZero = value === 0;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: isZero ? 0 : 2,
    maximumFractionDigits: isZero ? 0 : 2
  }).format(value);
}
