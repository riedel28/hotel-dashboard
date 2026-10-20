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
import { SegmentedControl } from '@/components/ui/segmented-control';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { loadCatalog } from '@/i18n';
import { Route as DashboardLayoutRoute } from '@/routes/_dashboard-layout';
import { LogoutDialog } from '@/routes/_dashboard-layout/-components/logout-dialog';
import { getPackageVersion } from '@/utils/package-info';
import { getInitials } from '@/utils/user';

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
            className="flex h-5 min-w-5 items-center gap-2 bg-popover px-1.5 text-[11px]"
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
              className="overflow-hidden py-1 [&>svg]:shrink-0"
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
            className="flex h-5 min-w-5 items-center gap-2 bg-popover px-1.5 text-[11px]"
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
  const isMobile = useIsMobile();

  const currentLanguage = languages.find((l) => l.code === locale);
  const version = getPackageVersion();
  const avatarFallback = (auth.user && getInitials(auth.user)) || '?';

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

  const logoutDialog = (
    <LogoutDialog
      open={logoutDialogOpen}
      onOpenChange={setLogoutDialogOpen}
      onLogoutSuccess={handleLogoutSuccess}
    />
  );

  if (isMobile) {
    return (
      <>
        <UserSheet
          avatarFallback={avatarFallback}
          locale={locale}
          onLocaleChange={handleChangeLocale}
          theme={theme}
          onThemeChange={setTheme}
          version={version}
          onLogout={handleLogout}
        />
        {logoutDialog}
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t`User menu`}
          nativeButton={false}
          className="focus-visible:outline-offset-0.5 outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-solid"
          render={
            <Avatar size="default" className="pointer-coarse:size-11">
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
              <UserCircleIcon />
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
      {logoutDialog}
    </>
  );
}

interface UserSheetProps {
  avatarFallback: string;
  locale: string;
  onLocaleChange: (locale: string) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  version: string;
  onLogout: () => void;
}

/** A row in the sheet: 44px tall, the height of a touch target. */
const sheetRowClassName =
  'flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-base outline-none hover:bg-accent focus-visible:bg-accent active:bg-accent [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground';

/**
 * The user menu on a phone: a bottom sheet in thumb reach, with language and
 * theme switched in place rather than in submenus that fly out sideways.
 */
function UserSheet({
  avatarFallback,
  locale,
  onLocaleChange,
  theme,
  onThemeChange,
  version,
  onLogout
}: UserSheetProps) {
  const auth = useAuth();
  const { t } = useLingui();
  const [open, setOpen] = useState(false);

  return (
    <Sheet side="bottom" open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t`User menu`}
        className="focus-visible:outline-offset-0.5 rounded-full outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-solid"
      >
        <Avatar size="default" className="pointer-coarse:size-11">
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      </SheetTrigger>
      <SheetContent showCloseButton={false}>
        <div className="flex items-center gap-3 px-4 pt-1 pb-3">
          <Avatar size="lg">
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 leading-tight">
            <SheetTitle className="truncate text-base">
              {auth.user?.first_name} {auth.user?.last_name}
            </SheetTitle>
            <span className="truncate text-sm text-muted-foreground">
              {auth.user?.email}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-t px-2 py-2">
          <Link
            to="/profile"
            className={sheetRowClassName}
            onClick={() => setOpen(false)}
          >
            <UserCircleIcon />
            <Trans>Profile</Trans>
          </Link>
          <div className="flex min-h-11 items-center justify-between gap-3 px-3">
            <span className="flex items-center gap-3 text-base [&_svg]:size-5 [&_svg]:text-muted-foreground">
              <GlobeIcon />
              <Trans>Language</Trans>
            </span>
            <SegmentedControl
              label={t`Language`}
              value={locale}
              onValueChange={onLocaleChange}
              options={languages.map((lang) => ({
                value: lang.code,
                label: lang.label
              }))}
              size="lg"
            />
          </div>
          <div className="flex min-h-11 items-center justify-between gap-3 px-3">
            <span className="flex items-center gap-3 text-base [&_svg]:size-5 [&_svg]:text-muted-foreground">
              <MonitorIcon />
              <Trans>Theme</Trans>
            </span>
            <SegmentedControl
              label={t`Theme`}
              value={theme}
              onValueChange={onThemeChange}
              options={[
                { value: 'light', label: t`Light` },
                { value: 'dark', label: t`Dark` },
                { value: 'system', label: t`System` }
              ]}
              size="lg"
            />
          </div>
        </div>
        <div className="border-t px-2 py-2">
          <button
            type="button"
            className={sheetRowClassName}
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <LogOutIcon />
            <Trans>Log out</Trans>
            <span className="ml-auto text-xs text-muted-foreground">
              <Trans>v{version}</Trans>
            </span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
