import { useLingui } from '@lingui/react/macro';

import { CountryFlag } from '@/components/ui/country-flag';
import { getCountryName } from '@/lib/countries';
import { cn } from '@/lib/utils';

/** A country's flag followed by its name in the user's language. */
export function CountryName({
  code,
  className
}: {
  code: string;
  className?: string;
}) {
  const { i18n } = useLingui();

  return (
    <div className={cn('flex min-w-0 items-center gap-1.5', className)}>
      <CountryFlag
        code={code}
        title={code}
        className="size-3.5 shrink-0"
        aria-label={code}
      />
      <span className="truncate">{getCountryName(code, i18n.locale)}</span>
    </div>
  );
}
