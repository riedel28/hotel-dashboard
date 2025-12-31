'use client';

import { Trans, useLingui } from '@lingui/react/macro';
import {
  Link,
  type LinkProps,
  useLocation
} from '@tanstack/react-router';
import {
  ArrowUpRightIcon,
  BedDoubleIcon,
  BedSingleIcon,
  BuildingIcon,
  CalendarIcon,
  CreditCardIcon,
  FileSpreadsheetIcon,
  Grid2X2Icon,
  HomeIcon,
  ListTodoIcon,
  LockIcon,
  MessageCircleIcon,
  ReceiptTextIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  SmartphoneIcon,
  SquareActivityIcon,
  TabletIcon,
  TvIcon,
  UsersIcon
} from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useView } from '@/contexts/view-context';
import { cn } from '@/lib/utils';

interface MobileMenuLinkProps extends LinkProps {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onNavigate?: () => void;
  className?: string;
}

function MobileMenuLink({
  icon: Icon,
  children,
  onNavigate,
  className,
  ...linkProps
}: MobileMenuLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === linkProps.to;

  return (
    <Link
      {...(linkProps as LinkProps)}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-foreground hover:bg-muted',
        className
      )}
    >
      <Icon className="size-5" />
      <span>{children}</span>
    </Link>
  );
}

// Sample data for content manager items
const contentManagerItems = [
  {
    name: 'Mobile CMS',
    url: '/mobile-cms',
    icon: SmartphoneIcon
  },
  {
    name: 'TV',
    url: '/tv',
    icon: TvIcon
  },
  {
    name: 'Products',
    url: '/products',
    icon: ShoppingBagIcon
  },
  {
    name: 'Events',
    url: '/events',
    icon: CalendarIcon
  }
];

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const { currentView } = useView();
  const { t } = useLingui();

  const handleNavigate = () => {
    onOpenChange(false);
  };

  // Admin menu content
  const AdminMenuContent = () => (
    <div className="flex flex-col gap-4">
      <MobileMenuLink
        to="/"
        icon={HomeIcon}
        onNavigate={handleNavigate}
      >
        <Trans>Start</Trans>
      </MobileMenuLink>
      <MobileMenuLink
        to="/properties"
        icon={BuildingIcon}
        onNavigate={handleNavigate}
      >
        <Trans>Properties</Trans>
      </MobileMenuLink>
      <MobileMenuLink
        to="/customers"
        icon={UsersIcon}
        onNavigate={handleNavigate}
      >
        <Trans>Customers</Trans>
      </MobileMenuLink>
    </div>
  );

  // User menu content
  const UserMenuContent = () => (
    <div className="flex flex-col gap-4">
      <MobileMenuLink
        to="/"
        icon={HomeIcon}
        onNavigate={handleNavigate}
      >
        <Trans>Start</Trans>
      </MobileMenuLink>
      <MobileMenuLink
        to="/monitoring"
        icon={SquareActivityIcon}
        onNavigate={handleNavigate}
      >
        <Trans>Monitoring</Trans>
      </MobileMenuLink>

      <Separator />

      <div className="flex flex-col gap-2">
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Trans>Front Office</Trans>
        </h3>
        <MobileMenuLink
          to="/reservations"
          icon={BedDoubleIcon}
          onNavigate={handleNavigate}
        >
          <Trans>Reservations</Trans>
        </MobileMenuLink>
        <MobileMenuLink
          to="/registration-forms"
          icon={ListTodoIcon}
          onNavigate={handleNavigate}
        >
          <Trans>Registration forms</Trans>
        </MobileMenuLink>
        <MobileMenuLink
          to="/payments"
          icon={ReceiptTextIcon}
          onNavigate={handleNavigate}
        >
          <Trans>Payments</Trans>
        </MobileMenuLink>
        <MobileMenuLink
          to="/orders"
          icon={ShoppingCartIcon}
          onNavigate={handleNavigate}
        >
          <Trans>Orders</Trans>
        </MobileMenuLink>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Trans>Content Manager</Trans>
        </h3>
        {contentManagerItems.map((item) => {
          const getItemLabel = (url: string) => {
            switch (url) {
              case '/mobile-cms':
                return <Trans>Mobile App</Trans>;
              case '/tv':
                return <Trans>TV App</Trans>;
              case '/products':
                return <Trans>Products</Trans>;
              case '/events':
                return <Trans>Events</Trans>;
              default:
                return item.name;
            }
          };

          return (
            <div key={item.name} className="flex items-center gap-2">
              <MobileMenuLink
                to={item.url as LinkProps['to']}
                icon={item.icon}
                onNavigate={handleNavigate}
                className="flex-1"
              >
                {getItemLabel(item.url)}
              </MobileMenuLink>
              {item.url === '/tv' && (
                <ArrowUpRightIcon
                  className="size-4 text-muted-foreground/80"
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Trans>Integrations</Trans>
        </h3>
        <MobileMenuLink
          to="/access-provider"
          icon={LockIcon}
          onNavigate={handleNavigate}
        >
          <Trans>Access Provider</Trans>
        </MobileMenuLink>
        <MobileMenuLink
          to="/pms-provider"
          icon={Grid2X2Icon}
          onNavigate={handleNavigate}
        >
          <Trans>PMS Provider</Trans>
        </MobileMenuLink>
        <MobileMenuLink
          to="/payment-provider"
          icon={CreditCardIcon}
          onNavigate={handleNavigate}
        >
          <Trans>Payment Provider</Trans>
        </MobileMenuLink>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Trans>Settings</Trans>
        </h3>
        <MobileMenuLink
          to="/company"
          icon={BuildingIcon}
          onNavigate={handleNavigate}
        >
          <Trans>Company data</Trans>
        </MobileMenuLink>
        <MobileMenuLink
          to="/checkin-page"
          icon={FileSpreadsheetIcon}
          onNavigate={handleNavigate}
        >
          <Trans>Checkin Page</Trans>
        </MobileMenuLink>
        <MobileMenuLink
          to="/users"
          icon={UsersIcon}
          onNavigate={handleNavigate}
        >
          <Trans>Users</Trans>
        </MobileMenuLink>
        <MobileMenuLink
          to="/rooms"
          icon={BedSingleIcon}
          onNavigate={handleNavigate}
        >
          <Trans>Rooms</Trans>
        </MobileMenuLink>
        <MobileMenuLink
          to="/devices"
          icon={TabletIcon}
          onNavigate={handleNavigate}
        >
          <Trans>Devices</Trans>
        </MobileMenuLink>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="inline-block rounded-md bg-primary p-1 text-white">
              <MessageCircleIcon className="size-4" />
            </div>
            <span className="text-sm font-semibold">
              <Trans>Backoffice Manager</Trans>
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {currentView === 'admin' ? (
            <AdminMenuContent />
          ) : (
            <UserMenuContent />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

