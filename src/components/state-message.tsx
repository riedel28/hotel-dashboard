import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';

/**
 * A state in place of content (a failed load, a missing page): an icon in a
 * framed tile, a title, a plain-words description and the way on (`children`,
 * its buttons). `inline` (the default) has no frame, for a slot that already
 * has one, such as a table's `error`; `card` stands on its own.
 */
export function StateMessage({
  icon: Icon,
  title,
  description,
  children,
  variant = 'inline',
  role,
  className
}: {
  icon: LucideIcon;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  variant?: 'card' | 'inline';
  role?: 'alert';
  className?: string;
}) {
  return (
    <Empty
      role={role}
      className={cn(
        'w-full gap-5',
        'animate-in duration-300 fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none',
        variant === 'inline'
          ? 'border-0 bg-transparent p-4 md:p-6'
          : 'min-h-72 border-solid bg-card md:p-10',
        className
      )}
    >
      <EmptyHeader className="gap-1.5">
        {/* A framed tile; in the dark a shade lighter than the card, like the
            button under it, so it stands out a little without a shadow */}
        <EmptyMedia className="mb-2 size-11 rounded-lg border text-muted-foreground dark:border-input dark:bg-input/30">
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        </EmptyMedia>
        {/* Its own colour: a table cell around it may set a muted one */}
        <EmptyTitle className="text-base font-semibold tracking-normal text-foreground">
          {title}
        </EmptyTitle>
        <EmptyDescription className="max-w-xs">{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        {children}
      </EmptyContent>
    </Empty>
  );
}
