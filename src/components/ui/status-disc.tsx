import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon, XIcon } from 'lucide-react';
import type * as React from 'react';

import { cn } from '@/lib/utils';

const statusDiscVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full',
  {
    variants: {
      status: {
        success: '',
        error: ''
      },
      variant: {
        /** Saturated fill, white glyph — for a single focal status. */
        solid: 'text-white',
        /** Tinted fill, saturated glyph — for lists and dense layouts. */
        soft: 'border border-border/20'
      },
      size: {
        xs: 'size-3.5',
        sm: 'size-4.5',
        md: 'size-9',
        lg: 'size-12'
      }
    },
    compoundVariants: [
      {
        status: 'success',
        variant: 'solid',
        // Measured: white on emerald-500 is 2.47:1, under the 3:1 WCAG 1.4.11
        // asks of a graphic that carries meaning. emerald-600 gives 3.65:1 if
        // that matters more than the lighter green.
        class: 'bg-emerald-500 dark:bg-emerald-600'
      },
      {
        status: 'error',
        variant: 'solid',
        class: 'bg-rose-500 dark:bg-rose-700'
      },
      {
        status: 'success',
        variant: 'soft',
        class:
          'bg-emerald-100 text-emerald-600 dark:bg-emerald-800/30 dark:text-emerald-400'
      },
      {
        status: 'error',
        variant: 'soft',
        class:
          'bg-rose-100 text-rose-600 dark:bg-rose-800/30 dark:text-rose-400'
      }
    ],
    defaultVariants: {
      status: 'success',
      variant: 'solid',
      size: 'md'
    }
  }
);

// The glyph scales with the disc, but its stroke must not: a weight that reads
// as crisp at 20px reads as clumsy at 64px.
const strokeWidths = {
  xs: 4.5,
  sm: 3.5,
  md: 3,
  lg: 2.5
} as const;

interface StatusDiscProps
  extends
    Omit<React.ComponentProps<'span'>, 'children'>,
    VariantProps<typeof statusDiscVariants> {
  /**
   * Accessible name. Omit when adjacent text already states the outcome — the
   * disc is then decorative and hidden from screen readers.
   */
  label?: string;
}

/**
 * Outcome indicator: a filled circle with a check (success) or a cross (error).
 * Shape carries the meaning alongside color, so it still reads without hue.
 */
function StatusDisc({
  status = 'success',
  variant = 'soft',
  size = 'md',
  label,
  className,
  ...props
}: StatusDiscProps) {
  const Icon = status === 'success' ? CheckIcon : XIcon;

  return (
    <span
      data-slot="status-disc"
      data-status={status}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(statusDiscVariants({ status, variant, size }), className)}
      {...props}
    >
      <Icon className="size-[55%]" strokeWidth={strokeWidths[size ?? 'md']} />
    </span>
  );
}

export { StatusDisc, type StatusDiscProps, statusDiscVariants };
