import { Trans } from '@lingui/react/macro';
import { ListFilterIcon } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * The button that unfolds a filter bar's filters on narrow screens, with how
 * many of them are set.
 */
export function FiltersToggle({
  open,
  onOpenChange,
  controls,
  activeCount,
  className
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The id of the folded filters */
  controls: string;
  activeCount: number;
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      // Greyed while any of the folded filters is set
      className={cn(activeCount > 0 && 'bg-muted dark:bg-input/50', className)}
      aria-expanded={open}
      aria-controls={controls}
      onClick={() => onOpenChange(!open)}
    >
      <ListFilterIcon />
      <Trans>Filters</Trans>
      {/* The same count badge the filters show their picks with */}
      {activeCount > 0 && (
        <Badge
          variant="secondary"
          color="gray"
          size="xs"
          className="tabular-nums"
        >
          {activeCount}
        </Badge>
      )}
    </Button>
  );
}

// Literal, so Tailwind sees the classes
const breakpoints = {
  lg: { toggle: 'lg:hidden', panel: 'max-lg:order-last lg:contents' },
  xl: { toggle: 'xl:hidden', panel: 'max-xl:order-last xl:contents' }
};

/**
 * A filter bar's filters, folded behind a "Filters" button below
 * `breakpoint`. Goes in a wrapping flex row after the search: the button
 * joins the search's row, anything after this (a refresh button) too, and the
 * filters unfold under them. From `breakpoint` up the filters are items of
 * the bar itself, laid out as if this weren't there.
 */
export function FoldedFilters({
  activeCount,
  breakpoint,
  children
}: {
  /** How many of the folded filters are set */
  activeCount: number;
  breakpoint: keyof typeof breakpoints;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const classes = breakpoints[breakpoint];

  return (
    <>
      <FiltersToggle
        open={open}
        onOpenChange={setOpen}
        controls={id}
        activeCount={activeCount}
        className={classes.toggle}
      />
      <div
        id={id}
        className={cn(
          'w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center',
          open ? 'flex' : 'hidden',
          classes.panel
        )}
      >
        {children}
      </div>
    </>
  );
}
