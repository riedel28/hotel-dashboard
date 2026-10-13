import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';

import { type BadgeColorProps, badgeColors } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// The dot of a colored segment: the saturated mid-tone of its Badge color, so
// it reads at a glance on the neutral segment.
const dotVariants: Record<BadgeColorProps, string> = {
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

// The empty string stands in for "no filter" — Base UI needs a value per item.
const ALL_VALUE = '';

interface DataGridSegmentedFilterOption<TValue extends string> {
  value: TValue;
  label: ReactNode;
  /** Adds a dot in the matching Badge color and tints the selected segment. */
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
  /**
   * One option is always chosen: there is no "All" segment, and
   * `onValueChange` never reports undefined.
   */
  required?: boolean;
  /**
   * Whether a selected colored segment becomes the badge of its color
   * (default). When false the color shows in the dot alone.
   */
  tintSelected?: boolean;
  className?: string;
}

function DataGridSegmentedFilter<TValue extends string>({
  options,
  value,
  onValueChange,
  label,
  allLabel,
  required = false,
  tintSelected = true,
  className
}: DataGridSegmentedFilterProps<TValue>) {
  const segments = required
    ? options
    : [{ value: ALL_VALUE, label: allLabel ?? <Trans>All</Trans> }, ...options];

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
        const isTinted = isSelected && tintSelected && color !== undefined;

        return (
          <RadioPrimitive.Root
            key={segment.value}
            value={segment.value}
            disabled={'disabled' in segment ? segment.disabled : undefined}
            className={cn(
              'focus-visible:outline-offset-0.5 inline-flex h-full min-w-0 grow cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-2.5 text-sm font-normal whitespace-nowrap transition-[color,background-color,border-color] duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-solid disabled:pointer-events-none disabled:opacity-50',
              isTinted
                ? // A tinted segment is the badge of that color; on the dark
                  // theme the badge outline is dropped
                  cn(badgeColors[color], 'dark:border-transparent')
                : isSelected
                  ? // On the dark theme muted is too close to the track to read as
                    // the chosen one
                    'border-foreground/2 bg-muted text-foreground dark:border-transparent dark:bg-foreground/15'
                  : 'text-foreground/60 hover:text-foreground'
            )}
          >
            {color && (
              <span
                className={cn(
                  'mr-0.5 size-1.5 rounded-full',
                  // Tinted: the badge's own dot, its text tint as a fill
                  isTinted ? 'bg-current/80' : dotVariants[color]
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
