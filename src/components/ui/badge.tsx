import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// Shared with components that take on a badge's color, e.g. a selected
// segment of SegmentedControl.
const badgeColors = {
  gray: 'border-foreground/10 bg-gray-100/70 text-gray-800 dark:bg-gray-600/30 dark:text-gray-300 [a]:hover:bg-gray-100 dark:[a]:hover:bg-gray-600/40',
  red: 'border-foreground/10 bg-red-100/70 text-red-800 dark:bg-red-800/30 dark:text-red-300 [a]:hover:bg-red-100 dark:[a]:hover:bg-red-800/40',
  yellow:
    'border-foreground/10 bg-yellow-100/70 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300 [a]:hover:bg-yellow-100 dark:[a]:hover:bg-yellow-800/40',
  emerald:
    'border-foreground/10 bg-emerald-100/70 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-300 [a]:hover:bg-emerald-100 dark:[a]:hover:bg-emerald-800/40',
  sky: 'border-foreground/10 bg-sky-100/70 text-sky-800 dark:bg-sky-800/30 dark:text-sky-300 [a]:hover:bg-sky-100 dark:[a]:hover:bg-sky-800/40',
  indigo:
    'border-foreground/10 bg-indigo-100/70 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-300 [a]:hover:bg-indigo-100 dark:[a]:hover:bg-indigo-800/40',
  orange:
    'border-foreground/10 bg-orange-100/70 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300 [a]:hover:bg-orange-100 dark:[a]:hover:bg-orange-800/40',
  teal: 'border-foreground/10 bg-teal-100/70 text-teal-800 dark:bg-teal-800/30 dark:text-teal-300 [a]:hover:bg-teal-100 dark:[a]:hover:bg-teal-800/40',
  fuchsia:
    'border-foreground/10 bg-fuchsia-100/70 text-fuchsia-800 dark:bg-fuchsia-800/30 dark:text-fuchsia-300 [a]:hover:bg-fuchsia-100 dark:[a]:hover:bg-fuchsia-800/40',
  pink: 'border-foreground/10 bg-pink-100/70 text-pink-800 dark:bg-pink-800/30 dark:text-pink-300 [a]:hover:bg-pink-100 dark:[a]:hover:bg-pink-800/40',
  rose: 'border-foreground/10 bg-rose-100/70 text-rose-800 dark:bg-rose-800/30 dark:text-rose-300 [a]:hover:bg-rose-100 dark:[a]:hover:bg-rose-800/40'
};

const badgeVariants = cva(
  'group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border border-transparent px-4 py-1.5 text-sm font-medium tracking-normal whitespace-nowrap transition-all transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 [&>svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'bg-badge-default text-badge-default-foreground [a]:hover:bg-badge-default/80',
        secondary:
          'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
        destructive:
          'border-danger/25 bg-danger-soft text-danger focus-visible:ring-danger/20 dark:border-danger/35 dark:focus-visible:ring-danger/40 [a]:hover:bg-danger/10',
        outline: 'border-border text-foreground [a]:hover:bg-muted',
        ghost:
          'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
        link: 'text-link underline-offset-4 hover:underline',
        info: 'bg-badge-info text-badge-info-foreground [a]:hover:bg-badge-info/80'
      },
      color: badgeColors,
      size: {
        xs: 'px-1.25 py-0.25 text-[11px] [&>svg]:size-2',
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

// A dot in a Badge color: its saturated mid-tone, so it reads at a glance
// beside plain text
const badgeDotColors: Record<BadgeColorProps, string> = {
  gray: 'bg-gray-500 dark:bg-gray-400',
  red: 'bg-red-500 dark:bg-red-400',
  yellow: 'bg-yellow-500 dark:bg-yellow-400',
  emerald: 'bg-emerald-500 dark:bg-emerald-400',
  sky: 'bg-sky-500 dark:bg-sky-400',
  indigo: 'bg-indigo-500 dark:bg-indigo-400',
  orange: 'bg-orange-500 dark:bg-orange-400',
  teal: 'bg-teal-500 dark:bg-teal-400',
  fuchsia: 'bg-fuchsia-500 dark:bg-fuchsia-400',
  pink: 'bg-pink-500 dark:bg-pink-400',
  rose: 'bg-rose-500 dark:bg-rose-400'
};

export {
  badgeDotColors,
  Badge,
  badgeColors,
  type BadgeColorProps,
  type BadgeProps,
  badgeVariants
};
