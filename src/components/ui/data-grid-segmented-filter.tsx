import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';

import { type BadgeColorProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// The dot of the Badge in the same color: the badge's text tint as a fill.
const dotVariants: Record<BadgeColorProps, string> = {
  gray: 'bg-gray-800/80 dark:bg-gray-300/80',
  red: 'bg-red-800/80 dark:bg-red-300/80',
  yellow: 'bg-yellow-800/80 dark:bg-yellow-300/80',
  emerald: 'bg-emerald-800/80 dark:bg-emerald-300/80',
  sky: 'bg-sky-800/80 dark:bg-sky-300/80',
  indigo: 'bg-indigo-800/80 dark:bg-indigo-300/80',
  orange: 'bg-orange-800/80 dark:bg-orange-300/80',
  teal: 'bg-teal-800/80 dark:bg-teal-300/80',
  fuchsia: 'bg-fuchsia-800/80 dark:bg-fuchsia-300/80',
  pink: 'bg-pink-800/80 dark:bg-pink-300/80',
  rose: 'bg-rose-700/80 dark:bg-rose-300/80'
};

// The empty string stands in for "no filter" — Base UI needs a value per item.
const ALL_VALUE = '';

interface DataGridSegmentedFilterOption<TValue extends string> {
  value: TValue;
  label: ReactNode;
  /** Puts a dot in the matching Badge color before the label. */
  color?: BadgeColorProps;
  disabled?: boolean;
}

interface DataGridSegmentedFilterProps<TValue extends string> {
  options: DataGridSegmentedFilterOption<TValue>[];
  value?: TValue;
  onValueChange: (value: TValue | undefined) => void;
  /** Accessible name of the group, e.g. t`Status`. */
  label: string;
  allLabel?: ReactNode;
  className?: string;
}

function DataGridSegmentedFilter<TValue extends string>({
  options,
  value,
  onValueChange,
  label,
  allLabel,
  className
}: DataGridSegmentedFilterProps<TValue>) {
  const segments = [
    { value: ALL_VALUE, label: allLabel ?? <Trans>All</Trans> },
    ...options
  ];

  return (
    <RadioGroupPrimitive
      aria-label={label}
      value={value ?? ALL_VALUE}
      onValueChange={(nextValue) =>
        onValueChange((nextValue as TValue) || undefined)
      }
      // Same height, radius and surface as the dropdown filters beside it
      className={cn(
        'flex h-9 w-fit shrink-0 items-center rounded-lg border border-input bg-background p-1 dark:bg-input/30',
        className
      )}
    >
      {segments.map((segment) => {
        const color = 'color' in segment ? segment.color : undefined;
        const isSelected = segment.value === (value ?? ALL_VALUE);

        return (
          <RadioPrimitive.Root
            key={segment.value}
            value={segment.value}
            disabled={'disabled' in segment ? segment.disabled : undefined}
            className={cn(
              'focus-visible:outline-offset-0.5 inline-flex h-full min-w-0 grow cursor-pointer items-center justify-center gap-1.5 rounded-md px-2.5 text-sm font-normal whitespace-nowrap transition-[color,background-color,scale] duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-solid active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
              isSelected
                ? 'bg-muted text-foreground'
                : 'text-foreground/60 hover:text-foreground'
            )}
          >
            {color && (
              <span
                className={cn(
                  'mr-0.5 size-1.5 rounded-full',
                  dotVariants[color]
                )}
                aria-hidden="true"
              />
            )}
            <span className="truncate">{segment.label}</span>
          </RadioPrimitive.Root>
        );
      })}
    </RadioGroupPrimitive>
  );
}

export {
  DataGridSegmentedFilter,
  type DataGridSegmentedFilterOption,
  type DataGridSegmentedFilterProps
};
