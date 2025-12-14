import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'text-sm gap-1 rounded-lg border tracking-wide border-transparent px-4 py-1.5 font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors overflow-hidden group/badge inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-badge-default text-badge-default-foreground [a]:hover:bg-badge-default/80',
        secondary:
          'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
        destructive:
          'bg-badge-destructive text-badge-destructive-foreground [a]:hover:bg-badge-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-badge-destructive/20',
        outline:
          'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
        ghost:
          'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
        link: 'text-primary underline-offset-4 hover:underline',
        info: 'bg-badge-info text-badge-info-foreground [a]:hover:bg-badge-info/80',
        success:
          'bg-badge-success text-badge-success-foreground [a]:hover:bg-badge-success/80',
        warning:
          'bg-badge-warning text-badge-warning-foreground [a]:hover:bg-badge-warning/80'
      },
      size: {
        sm: 'text-xs px-3 py-1 [&>svg]:size-3',
        md: 'text-sm px-4 py-1.5 [&>svg]:size-3',
        lg: 'text-base px-5 py-2 [&>svg]:size-4'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

type BadgeProps = useRender.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants>;

function Badge({
  className,
  variant = 'default',
  size = 'md',
  render,
  ...props
}: BadgeProps) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ className, variant, size }))
      },
      props
    ),
    render,
    state: {
      slot: 'badge',
      variant
    }
  });
}

export { Badge, badgeVariants, type BadgeProps };
