import { Link, type LinkProps } from '@tanstack/react-router';
import { ChevronRightIcon } from 'lucide-react';
import type * as React from 'react';

export interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  to: NonNullable<LinkProps['to']>;
  search?: LinkProps['search'];
}

/**
 * The start pages' cards. The whole card is the link. On a phone it is a
 * compact row with a chevron, so a handful fit on the first screen; from md up
 * the icon sits above the title, two to a row from lg.
 */
export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid max-w-4xl grid-cols-1 gap-3 md:gap-6 lg:grid-cols-2">
      {actions.map(({ title, description, icon: Icon, to, search }) => (
        <Link
          key={to}
          to={to}
          search={search}
          className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-none transition-all duration-200 outline-none hover:bg-accent/30 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-primary active:bg-accent/30 md:block md:space-y-1.5 md:p-5 dark:hover:bg-card/85"
        >
          <div className="w-fit shrink-0 rounded-lg bg-accent p-2 transition-colors group-hover:bg-primary-soft">
            <Icon className="size-4 text-accent-foreground transition-colors group-hover:text-primary-soft-foreground" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5 md:space-y-1.5">
            <h3 className="text-base font-semibold md:text-lg">{title}</h3>
            <p className="text-sm text-pretty text-muted-foreground md:text-balance">
              {description}
            </p>
          </div>
          <ChevronRightIcon
            className="size-4 shrink-0 self-center text-muted-foreground md:hidden"
            aria-hidden="true"
          />
        </Link>
      ))}
    </div>
  );
}
