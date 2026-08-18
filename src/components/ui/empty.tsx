import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const emptyVariants = cva(
  'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border p-6 text-center text-balance md:p-12',
  {
    variants: {
      variant: {
        default: 'border-dashed bg-card',
        // The description is tinted rather than left muted: muted-foreground
        // only reaches 4.1:1 on the tinted card, below the 4.5:1 AA floor for
        // body text. The title stays neutral — it reads at 17:1, and keeping
        // red for the action preserves the hierarchy.
        destructive:
          'border-destructive/10 bg-destructive/5 [&_[data-slot=empty-description]]:text-destructive/90',
        warning:
          'border-yellow-200/50 bg-yellow-50/50 dark:border-yellow-800/30 dark:bg-yellow-950/10'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

/**
 * Placeholder for content that isn't there — nothing yet (`default`) or a
 * failed load (`destructive`). Both are announced to screen readers, since the
 * card replaces content the user was waiting for.
 */
function Empty({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyVariants>) {
  return (
    <div
      data-slot="empty"
      data-variant={variant}
      role={variant === 'default' ? 'status' : 'alert'}
      className={cn(emptyVariants({ variant, className }))}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        'flex max-w-sm flex-col items-center gap-2.5 text-center',
        className
      )}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6",
        destructive:
          "flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive [&_svg:not([class*='size-'])]:size-6"
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-title"
      className={cn('text-lg font-medium tracking-tight', className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        'text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
        className
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        'flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance',
        className
      )}
      {...props}
    />
  );
}

export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
};
