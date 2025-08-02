import { useState } from 'react';

import { useAuth } from '@/auth';
import { useIntlContext } from '@/i18n/intl-provider';
import { Route as DashboardLayoutRoute } from '@/routes/_dashboard-layout';
import { LogoutDialog } from '@/routes/_dashboard-layout/-components/logout-dialog';
import { Link } from '@tanstack/react-router';
import { CheckIcon, GlobeIcon, LogOutIcon, UserCircleIcon } from 'lucide-react';
import Flag from 'react-flagkit';
import { FormattedMessage } from 'react-intl';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en', label: 'English', country: 'GB' },
  { code: 'de', label: 'Deutsch', country: 'DE' }
];

export default function UserMenu() {
  const auth = useAuth();

  const navigate = DashboardLayoutRoute.useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { locale, setLocale } = useIntlContext();
  const lang = languages.find((l) => l.code === locale);

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutSuccess = () => {
    navigate({ to: '/auth/login' });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-full border-2"
          >
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt={`${auth.user?.firstName} ${auth.user?.lastName}`}
              />
              <AvatarFallback className="rounded-lg">
                <FormattedMessage id="avatar.fallback" defaultMessage="CN" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1.5 py-1.5 text-left text-sm">
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {auth.user?.firstName} {auth.user?.lastName}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {auth.user?.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <UserCircleIcon />
                <FormattedMessage id="user.profile" defaultMessage="Profile" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger withChevron={false}>
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GlobeIcon className="text-muted-foreground h-4 w-4" />
                    <FormattedMessage
                      id="user.language"
                      defaultMessage="Language"
                    />
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
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-[180px]">
                  <DropdownMenuRadioGroup
                    value={locale}
                    onValueChange={setLocale}
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
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOutIcon />
            <FormattedMessage id="user.logout" defaultMessage="Log out" />
            <span className="text-muted-foreground ml-auto text-xs">
              <FormattedMessage id="app.version" defaultMessage="v1.2.4" />
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
