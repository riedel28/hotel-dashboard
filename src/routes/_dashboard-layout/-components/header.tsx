import { useAuth } from '@/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Route as DashboardLayoutRoute } from '@/routes/_dashboard-layout';
import PropertySelector from '@/routes/_dashboard-layout/-components/property-selector';
import UserMenu from '@/routes/_dashboard-layout/-components/user-menu';
import ViewSelector from '@/routes/_dashboard-layout/-components/view-selector';

export default function Header() {
  const { properties } = DashboardLayoutRoute.useLoaderData();
  const { user } = useAuth();
  const isAdmin = user?.is_admin === true;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:ps-3.5">
      <div className="flex h-14 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger className="group size-8 hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 md:hidden inline-flex items-center justify-center rounded-md">
              <svg
                className="pointer-events-none"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 12L20 12"
                  className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                />
                <path
                  d="M4 12H20"
                  className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                />
                <path
                  d="M4 12H20"
                  className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                />
              </svg>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-36 p-1 md:hidden"
            ></PopoverContent>
          </Popover>
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              {isAdmin && (
                <>
                  <BreadcrumbItem>
                    <ViewSelector />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <PropertySelector properties={properties.index} />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* User menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
