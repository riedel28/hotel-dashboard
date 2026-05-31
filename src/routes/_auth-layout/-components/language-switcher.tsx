import { useLingui } from '@lingui/react/macro';
import { GlobeIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { CountryFlag } from '@/components/ui/country-flag';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { loadCatalog } from '@/i18n';

const languages = [
  { code: 'en', label: 'English', country: 'GB' },
  { code: 'de', label: 'Deutsch', country: 'DE' }
];

interface LanguageSwitcherProps {
  trigger?: ReactNode;
  align?: React.ComponentProps<typeof DropdownMenuContent>['align'];
}

export function LanguageSwitcher({ align = 'end' }: LanguageSwitcherProps) {
  const { i18n, t } = useLingui();
  const locale = i18n.locale;

  const handleChangeLocale = (value: string) => {
    loadCatalog(value);
    localStorage.setItem('locale', value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton
        render={(props: ButtonProps) => (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={t`Change language`}
            {...props}
          >
            <GlobeIcon />
          </Button>
        )}
      />

      <DropdownMenuContent align={align} className="w-30">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={handleChangeLocale}
        >
          {languages.map(lang => (
            <DropdownMenuRadioItem
              key={lang.code}
              value={lang.code}
              className="overflow-hidden [&>svg]:shrink-0 px-1.5 py-1"
            >
              <CountryFlag
                code={lang.country}
                title={lang.label}
                className="size-4"
                aria-label={lang.label}
              />

              {lang.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
