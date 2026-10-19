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
 * on a phone it is not squeezed beside them. The row is as tall as the title
 * with or without buttons, so breadcrumb, title and subtitle sit at the same
 * distances on every page.
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
        {/* 36px buttons on the 28px title row: centred on it, they reach
            4px past it either way instead of making it taller */}
        {actions && <div className="-my-1 flex shrink-0 gap-2">{actions}</div>}
      </div>
      {description && (
        <p className="max-w-2xl text-sm text-pretty text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
