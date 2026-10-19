import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { EmptyMedia } from '@/components/ui/empty';
import { cn } from '@/lib/utils';

/**
 * In place of a list's rows when it has none: an icon, a title, a line on
 * why and maybe one thing to do about it. Pass it as a table's
 * `emptyMessage`.
 */
export function EmptyTableState({
  icon,
  title,
  description,
  action
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /**
   * One button. Adding the first record is the page's main action, so it
   * takes the primary color; a way out (clear the filters) is secondary.
   */
  action?: {
    label: ReactNode;
    onClick: () => void;
    icon?: ReactNode;
    variant?: 'default' | 'secondary' | 'outline';
    className?: string;
  };
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-6 text-sm">
      {icon && (
        // Sized to the text beside it, not to a full-page empty state
        <EmptyMedia
          variant="icon"
          className="mb-2 size-8 [&_svg:not([class*='size-'])]:size-4"
          aria-hidden="true"
        >
          {icon}
        </EmptyMedia>
      )}
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="text-muted-foreground">{description}</p>}
      {action && (
        <Button
          variant={action.variant ?? 'default'}
          size="sm"
          className={cn('mt-2', action.className)}
          onClick={action.onClick}
        >
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  );
}

/** When a list's filters match nothing. */
export function EmptyFilterResult({
  description,
  onClearFilters
}: {
  description: ReactNode;
  onClearFilters: () => void;
}) {
  return (
    <EmptyTableState
      title={<Trans>Nothing found</Trans>}
      description={description}
      action={{
        label: <Trans>Clear filters</Trans>,
        onClick: onClearFilters,
        variant: 'secondary'
      }}
    />
  );
}
