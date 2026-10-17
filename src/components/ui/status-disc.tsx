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
        /** Saturated fill, contrasting glyph — for a single focal status. */
        solid: '',
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
        class: 'bg-success-solid text-success-solid-foreground'
      },
      {
        status: 'error',
        variant: 'solid',
        class: 'bg-danger-solid text-danger-solid-foreground'
      },
      {
        status: 'success',
        variant: 'soft',
        class: 'bg-success-soft text-success'
      },
      {
        status: 'error',
        variant: 'soft',
        class: 'bg-danger-soft text-danger'
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
