import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import type { ReactNode } from 'react';

import {
  type BadgeColorProps,
  badgeColors,
  badgeDotColors
} from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SegmentedControlOption<TValue extends string> {
  value: TValue;
  label: ReactNode;
  /** Adds a dot in the matching Badge color and tints the selected segment. */
  color?: BadgeColorProps;
  disabled?: boolean;
}

interface SegmentedControlProps<TValue extends string> {
  options: SegmentedControlOption<TValue>[];
  /** One option is always chosen */
  value: TValue;
  onValueChange: (value: TValue) => void;
  /** Accessible name of the group, e.g. t`Status`. */
  label: string;
  /**
   * Whether a selected colored segment becomes the badge of its color
   * (default). When false the color shows in the dot alone.
   */
  tintSelected?: boolean;
  /**
   * 'sm' for compact toolbars, e.g. above a preview; 'lg' for touch, e.g. in
   * a bottom sheet.
   */
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

/** A row of segments of which exactly one is chosen: a radio group. */
function SegmentedControl<TValue extends string>({
  options,
  value,
  onValueChange,
  label,
  tintSelected = true,
  size = 'default',
  className
}: SegmentedControlProps<TValue>) {
  return (
    <RadioGroupPrimitive
      aria-label={label}
      value={value}
      // Base UI reports the value untyped; it is one of the options'
      onValueChange={(nextValue) => onValueChange(nextValue as TValue)}
      // Same height, radius and surface as the dropdown filters beside it
      className={cn(
        'flex h-9 w-fit shrink-0 items-center rounded-lg border border-input bg-background p-1 dark:bg-input/30',
        size === 'sm' && 'h-7 p-0.5',
        // Rounder as it grows: the segments stay concentric with the track
        size === 'lg' && 'h-10 rounded-xl p-0.5',
        className
      )}
    >
      {options.map(({ color, ...option }) => {
        const isSelected = option.value === value;
        const isTinted = isSelected && tintSelected && color !== undefined;

        return (
          <RadioPrimitive.Root
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={cn(
              'focus-visible:outline-offset-0.5 inline-flex h-full min-w-0 grow cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-2.5 text-sm font-normal whitespace-nowrap transition-[color,background-color,border-color] duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-solid disabled:pointer-events-none disabled:opacity-50',
              isTinted
                ? // A tinted segment is the badge of that color; on the dark
                  // theme the badge outline is dropped
                  cn(badgeColors[color], 'dark:border-transparent')
                : isSelected
                  ? // On the dark theme muted is too close to the track to read
                    // as chosen; the input token at the outline button's
                    // hover strength stands out without glaring
                    'border-foreground/2 bg-muted text-foreground dark:border-transparent dark:bg-input/50'
                  : 'text-muted-foreground hover:text-foreground',
              size === 'sm' && 'px-2 text-xs',
              size === 'lg' && 'rounded-lg px-3'
            )}
          >
            {color && (
              <span
                className={cn(
                  'mr-0.5 size-1.5 rounded-full',
                  // Tinted: the badge's own dot, its text tint as a fill
                  isTinted ? 'bg-current/80' : badgeDotColors[color]
                )}
                aria-hidden="true"
              />
            )}
            <span className="truncate">{option.label}</span>
          </RadioPrimitive.Root>
        );
      })}
    </RadioGroupPrimitive>
  );
}

export {
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlProps
};
