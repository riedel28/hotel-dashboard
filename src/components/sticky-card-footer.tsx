import type { ComponentProps } from 'react';

import { CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * A card's action bar that stays at the bottom of the viewport while the card
 * scrolls. The negative bottom offset matches the scroll container's bottom
 * padding (main: pb-4 / md:pb-8) so the bar sits flush against the very bottom
 * of the viewport, not above the padding. The card needs `overflow-visible`.
 */
export function StickyCardFooter({
  className,
  ...props
}: ComponentProps<typeof CardFooter>) {
  return (
    <CardFooter
      className={cn(
        'sticky -bottom-4 z-10 -mb-6 rounded-b-xl border-t border-border/60 bg-card/80 py-4! backdrop-blur md:-bottom-8',
        className
      )}
      {...props}
    />
  );
}
