import { useLingui } from '@lingui/react/macro';
import { CheckIcon, GlobeIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import * as React from 'react';
import Flag from 'react-flagkit';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
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

export function LanguageSwitcher({
  trigger,
  align = 'end'
}: LanguageSwitcherProps) {
  const { i18n, t } = useLingui();
  const locale = i18n.locale;

  const handleChangeLocale = (value: string) => {
    loadCatalog(value);
    localStorage.setItem('locale', value);
  };

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-md"
      aria-label={t`Change language`}
    >
      <GlobeIcon className="h-4 w-4" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-[180px]">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={handleChangeLocale}
        >
          {languages.map((lang) => (
            <DropdownMenuRadioItem
              key={lang.code}
              value={lang.code}
              className="overflow-hidden [&>svg]:shrink-0"
            >
              <Flag
                country={lang.country}
                title={lang.label}
                className="size-3.5 rounded-sm"
                aria-label={lang.label}
              />
              {lang.label}
              <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
                <DropdownMenuItemIndicator>
                  <CheckIcon />
                </DropdownMenuItemIndicator>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
