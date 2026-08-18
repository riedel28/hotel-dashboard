import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-lg border border-transparent px-4 py-1.5 text-sm font-medium tracking-normal whitespace-nowrap transition-all transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'bg-badge-default text-badge-default-foreground [a]:hover:bg-badge-default/80',
        secondary:
          'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
        destructive:
          'border-badge-destructive-foreground/25 bg-badge-destructive text-badge-destructive-foreground focus-visible:ring-destructive/20 dark:border-badge-destructive-foreground/35 dark:bg-badge-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-badge-destructive/80',
        outline:
          'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
        ghost:
          'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
        link: 'text-primary underline-offset-4 hover:underline',
        info: 'bg-badge-info text-badge-info-foreground [a]:hover:bg-badge-info/80'
      },
      color: {
        gray: 'border-gray-200/70 bg-gray-50 text-gray-800 dark:border-gray-700/30 dark:bg-gray-600/20 dark:text-gray-300 [a]:hover:bg-gray-100 dark:[a]:hover:bg-gray-800/30',
        red: 'border-red-200/70 bg-red-50 text-red-800 dark:border-red-800/30 dark:bg-red-800/20 dark:text-red-300 [a]:hover:bg-red-100 dark:[a]:hover:bg-red-800/30',
        yellow:
          'border-yellow-200/70 bg-yellow-50 text-yellow-800 dark:border-yellow-800/30 dark:bg-yellow-800/20 dark:text-yellow-300 [a]:hover:bg-yellow-100 dark:[a]:hover:bg-yellow-800/30',
        emerald:
          'border-emerald-200/70 bg-emerald-50 text-emerald-800 dark:border-emerald-800/30 dark:bg-emerald-800/20 dark:text-emerald-300 [a]:hover:bg-emerald-100 dark:[a]:hover:bg-emerald-800/30',
        sky: 'border-sky-200/70 bg-sky-50 text-sky-700 dark:border-sky-800/30 dark:bg-sky-800/20 dark:text-sky-300 [a]:hover:bg-sky-100 dark:[a]:hover:bg-sky-800/30',
        indigo:
          'border-indigo-200/70 bg-indigo-50 text-indigo-800 dark:border-indigo-800/30 dark:bg-indigo-800/20 dark:text-indigo-300 [a]:hover:bg-indigo-100 dark:[a]:hover:bg-indigo-800/30',
        orange:
          'border-orange-200/70 bg-orange-50 text-orange-800 dark:border-orange-800/30 dark:bg-orange-800/20 dark:text-orange-300 [a]:hover:bg-orange-100 dark:[a]:hover:bg-orange-800/30',
        teal: 'border-teal-200/70 bg-teal-50 text-teal-800 dark:border-teal-800/30 dark:bg-teal-800/20 dark:text-teal-300 [a]:hover:bg-teal-100 dark:[a]:hover:bg-teal-800/30',
        fuchsia:
          'border-fuchsia-200/70 bg-fuchsia-50 text-fuchsia-800 dark:border-fuchsia-800/30 dark:bg-fuchsia-800/20 dark:text-fuchsia-300 [a]:hover:bg-fuchsia-100 dark:[a]:hover:bg-fuchsia-800/30',
        pink: 'border-pink-200/70 bg-pink-50 text-pink-800 dark:border-pink-800/30 dark:bg-pink-800/20 dark:text-pink-300 [a]:hover:bg-pink-100 dark:[a]:hover:bg-pink-800/30',
        rose: 'border-rose-200/70 bg-rose-50 text-rose-800 dark:border-rose-800/30 dark:bg-rose-800/20 dark:text-rose-300 [a]:hover:bg-rose-100 dark:[a]:hover:bg-rose-800/30'
      },
      size: {
        xs: 'rounded-md px-1.25 py-0.25 text-[11px] [&>svg]:size-2',
        sm: 'px-1.5 py-0.25 text-[12px] [&>svg]:size-3',
        md: 'px-4 py-1.5 text-sm [&>svg]:size-3',
        lg: 'px-5 py-2 text-base [&>svg]:size-4'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm'
    }
  }
);

type BadgeVariantProps = VariantProps<typeof badgeVariants>;
type BadgeColorProps = NonNullable<BadgeVariantProps['color']>;

type BadgeProps = Omit<
  useRender.ComponentProps<'span'>,
  keyof BadgeVariantProps
> &
  BadgeVariantProps;

function Badge({
  className,
  color,
  variant = 'default',
  size = 'md',
  render,
  ...props
}: BadgeProps) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ className, color, variant, size }))
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

export { Badge, type BadgeColorProps, type BadgeProps, badgeVariants };
