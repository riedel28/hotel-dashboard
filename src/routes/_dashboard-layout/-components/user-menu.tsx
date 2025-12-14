import { Trans, useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import { GlobeIcon, LogOutIcon, UserCircleIcon } from 'lucide-react';
import { useState } from 'react';
import Flag from 'react-flagkit';
import { useAuth } from '@/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
      <div className="flex items-center gap-2 px-1.5 py-1.5 text-left text-sm">
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
            <GlobeIcon className="h-4 w-4 text-muted-foreground" />
            <Trans>Language</Trans>
          </div>
          <Badge
            variant="outline"
            className="flex h-6 min-w-6 items-center text-xs gap-2 rounded-sm"
          >
            {currentLanguage?.label}
            <Flag
              country={currentLanguage?.country ?? 'GB'}
              title={currentLanguage?.label}
              className="size-3.5 rounded-sm"
              aria-label={currentLanguage?.label}
            />
          </Badge>
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-[180px]">
        <DropdownMenuRadioGroup
          value={currentLocale}
          onValueChange={onLocaleChange}
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
      <LogOutIcon className="text-muted-foreground" />
      <Trans>Log out</Trans>
      <span className="ml-auto text-xs text-muted-foreground!">
        <Trans>v{version}</Trans>
      </span>
    </DropdownMenuItem>
  );
}

export default function UserMenu() {
  const auth = useAuth();
  const { i18n } = useLingui();
  const locale = i18n.locale;

  const navigate = DashboardLayoutRoute.useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const currentLanguage = languages.find((l) => l.code === locale);
  const version = getPackageVersion();

  const handleChangeLocale = (value: string) => {
    loadCatalog(value);
    localStorage.setItem('locale', value);
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutSuccess = () => {
    navigate({ to: '/auth/login' });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar size="default">
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt={`${auth.user?.first_name} ${auth.user?.last_name}`}
            />
            <AvatarFallback className="rounded-lg">
              <Trans>CN</Trans>
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-56 rounded-lg"
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
              <UserCircleIcon className="text-muted-foreground" />
              <Trans>Profile</Trans>
            </DropdownMenuItem>
            <LanguageSubmenu
              languages={languages}
              currentLocale={locale}
              currentLanguage={currentLanguage}
              onLocaleChange={handleChangeLocale}
            />
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
