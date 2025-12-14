import { useLingui } from '@lingui/react/macro';
import { GlobeIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import * as React from 'react';
import Flag from 'react-flagkit';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { loadCatalog } from '@/i18n';
import { cn } from '@/lib/utils';

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
        render={(props: ButtonProps) => (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9 rounded-md text-muted-foreground',
              'dropdown-menu-trigger:data-popup-open:text-red-500 dropdown-menu-trigger:data-popup-open:bg-muted'
            )}
            aria-label={t`Change language`}
            {...props}
          >
            <GlobeIcon className="h-4 w-4" />
          </Button>
        )}
      />

      <DropdownMenuContent align={align} className="w-[160px]">
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
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
