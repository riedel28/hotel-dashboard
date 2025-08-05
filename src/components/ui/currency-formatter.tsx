import { useIntl } from 'react-intl';

interface CurrencyFormatterProps {
  value: number;
  currency?: string;
  locale?: string;
  className?: string;
}

export function CurrencyFormatter({
  value,
  currency = 'EUR',
  locale,
  className = ''
}: CurrencyFormatterProps) {
  const intl = useIntl();

  // Use the current locale from react-intl if no locale is provided
  const currentLocale = locale || intl.locale;

  const amount = new Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2
  }).format(value);

  return <span className={className}>{amount}</span>;
}
