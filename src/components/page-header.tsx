import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  /** A line under the title on what the page is for. */
  description?: ReactNode;
  /** The page's own buttons, on the title's row. */
  actions?: ReactNode;
  className?: string;
}

/**
 * A page's title, its subtitle and its buttons, the same on every page.
 * The buttons share the title's row and the subtitle runs under both, so
 * on a phone it is not squeezed beside them. Without buttons the row is as
 * tall as the title, keeping the subtitle close under it.
 */
export function PageHeader({
  title,
  description,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 space-y-1', className)}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 text-xl font-bold text-balance">{title}</h1>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
      {description && (
        <p className="max-w-2xl text-sm text-pretty text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
