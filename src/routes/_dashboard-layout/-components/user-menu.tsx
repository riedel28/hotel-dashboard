import { Trans, useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import {
  GlobeIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/auth';
import { useTheme } from '@/components/theme-provider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CountryFlag } from '@/components/ui/country-flag';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { loadCatalog } from '@/i18n';
import { Route as DashboardLayoutRoute } from '@/routes/_dashboard-layout';
import { LogoutDialog } from '@/routes/_dashboard-layout/-components/logout-dialog';
import { getPackageVersion } from '@/utils/package-info';

interface Language {
  code: 'en' | 'de';
  label: 'English' | 'Deutsch';
  country: 'GB' | 'DE';
}

const languages: Language[] = [
  { code: 'en', label: 'English', country: 'GB' },
  { code: 'de', label: 'Deutsch', country: 'DE' }
] as const;

interface UserInfoLabelProps {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

function UserInfoLabel({ firstName, lastName, email }: UserInfoLabelProps) {
  return (
    <DropdownMenuLabel className="p-0 font-normal">
      <div className="flex items-center gap-2 px-2 py-1 text-left text-sm">
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium text-foreground">
            {firstName} {lastName}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {email}
          </span>
        </div>
      </div>
    </DropdownMenuLabel>
  );
}

interface LanguageSubmenuProps {
  languages: Language[];
  currentLocale: string;
  currentLanguage: Language | undefined;
  onLocaleChange: (locale: string) => void;
}

function LanguageSubmenu({
  languages,
  currentLocale,
  currentLanguage,
  onLocaleChange
}: LanguageSubmenuProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger hasChevron={false}>
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GlobeIcon />
            <Trans>Language</Trans>
          </div>

          <Badge
            variant="outline"
            className="flex h-5 min-w-5 items-center text-[11px] gap-2 px-1.5 rounded-sm"
          >
            {currentLanguage?.label}
            <CountryFlag
              code={currentLanguage?.country ?? 'GB'}
              title={currentLanguage?.label}
              className="size-3.5"
              aria-label={currentLanguage?.label}
            />
          </Badge>
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-34">
        <DropdownMenuRadioGroup
          value={currentLocale}
          onValueChange={onLocaleChange}
        >
          {languages.map((lang) => (
            <DropdownMenuRadioItem
              key={lang.code}
              value={lang.code}
              indicator="check"
              className="overflow-hidden [&>svg]:shrink-0 py-1"
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
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

const themeLabels = {
  light: 'Light',
  dark: 'Dark',
  system: 'System'
} as const;

const themeIcons = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon
} as const;

type Theme = 'light' | 'dark' | 'system';

interface ThemeSubmenuProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

function ThemeSubmenu({ currentTheme, onThemeChange }: ThemeSubmenuProps) {
  const ThemeIcon = themeIcons[currentTheme];

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger hasChevron={false}>
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ThemeIcon />
            <Trans>Theme</Trans>
          </div>
          <Badge
            variant="outline"
            className="flex h-5 min-w-5 items-center text-[11px] gap-2 px-1.5 rounded-sm"
          >
            <Trans>{themeLabels[currentTheme]}</Trans>
          </Badge>
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-34">
        <DropdownMenuRadioGroup
          value={currentTheme}
          onValueChange={(value) => onThemeChange(value as Theme)}
        >
          <DropdownMenuRadioItem value="light" indicator="check">
            <SunIcon />
            <Trans>Light</Trans>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" indicator="check">
            <MoonIcon />
            <Trans>Dark</Trans>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" indicator="check">
            <MonitorIcon />
            <Trans>System</Trans>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

interface LogoutMenuItemProps {
  version: string;
  onLogout: () => void;
}

function LogoutMenuItem({ version, onLogout }: LogoutMenuItemProps) {
  return (
    <DropdownMenuItem className="group" onClick={onLogout}>
      <LogOutIcon />
      <Trans>Log out</Trans>
      <span className="ml-auto text-xs text-muted-foreground!">
        <Trans>v{version}</Trans>
      </span>
    </DropdownMenuItem>
  );
}

export default function UserMenu() {
  const auth = useAuth();
  const { i18n, t } = useLingui();
  const locale = i18n.locale;
  const { theme, setTheme } = useTheme();

  const navigate = DashboardLayoutRoute.useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const currentLanguage = languages.find((l) => l.code === locale);
  const version = getPackageVersion();
  const avatarFallback = getAvatarFallback(
    auth.user?.first_name,
    auth.user?.last_name
  );

  function getAvatarFallback(
    firstName?: string | null,
    lastName?: string | null
  ) {
    const firstInitial = firstName?.trim().charAt(0).toUpperCase() ?? '';
    const lastInitial = lastName?.trim().charAt(0).toUpperCase() ?? '';

    return `${firstInitial}${lastInitial}` || '?';
  }

  const handleChangeLocale = (value: string) => {
    loadCatalog(value);
    localStorage.setItem('locale', value);
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutSuccess = async () => {
    await navigate({ to: '/auth/login', replace: true });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t`User menu`}
          nativeButton={false}
          render={
            <Avatar size="default">
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          }
        />

        <DropdownMenuContent
          className="min-w-50 rounded-lg"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuGroup>
            <UserInfoLabel
              firstName={auth.user?.first_name}
              lastName={auth.user?.last_name}
              email={auth.user?.email}
            />
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem render={<Link to="/profile" />}>
              <UserCircleIcon className="mr-0.5" />
              <Trans>Profile</Trans>
            </DropdownMenuItem>
            <LanguageSubmenu
              languages={languages}
              currentLocale={locale}
              currentLanguage={currentLanguage}
              onLocaleChange={handleChangeLocale}
            />
            <ThemeSubmenu currentTheme={theme} onThemeChange={setTheme} />
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <LogoutMenuItem version={version} onLogout={handleLogout} />
        </DropdownMenuContent>
      </DropdownMenu>
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onLogoutSuccess={handleLogoutSuccess}
      />
    </>
  );
}
