import { Trans, useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import { GlobeIcon, LogOutIcon, UserCircleIcon } from 'lucide-react';
import { useState } from 'react';
import Flag from 'react-flagkit';
import { useAuth } from '@/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

const languages = [
  { code: 'en', label: 'English', country: 'GB' },
  { code: 'de', label: 'Deutsch', country: 'DE' }
];

export default function UserMenu() {
  const auth = useAuth();
  const { i18n } = useLingui();
  const locale = i18n.locale;

  const navigate = DashboardLayoutRoute.useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const lang = languages.find((l) => l.code === locale);
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
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt={`${auth.user?.first_name} ${auth.user?.last_name}`}
              />
              <AvatarFallback className="rounded-lg">
                <Trans>CN</Trans>
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-56 rounded-lg"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1.5 py-1.5 text-left text-sm">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-foreground">
                    {auth.user?.first_name} {auth.user?.last_name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {auth.user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem render={<Link to="/profile" />}>
              <UserCircleIcon />
              <Trans>Profile</Trans>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger hasChevron={false}>
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                    <Trans>Language</Trans>
                  </div>
                  <Badge
                    variant="outline"
                    className="flex h-6 min-w-6 items-center gap-2 rounded-sm"
                  >
                    {lang?.label}

                    <Flag
                      country={lang?.country ?? 'GB'}
                      title={lang?.label}
                      className="size-3.5 rounded-sm"
                      aria-label={lang?.label}
                    />
                  </Badge>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-[180px]">
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
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="group" onClick={handleLogout}>
            <LogOutIcon />
            <Trans>Log out</Trans>
            <span className="ml-auto text-xs text-muted-foreground!">
              <Trans>v{version}</Trans>
            </span>
          </DropdownMenuItem>
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
