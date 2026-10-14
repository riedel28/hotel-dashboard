import * as React from 'react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface RadioCardsProps<TValue extends string> {
  value: TValue;
  onValueChange: (value: TValue) => void;
  options: { value: TValue; label: React.ReactNode }[];
  disabled?: boolean;
  'aria-labelledby'?: string;
  className?: string;
}

// A choice of two or three, side by side as bordered cards with a radio in
// each — input-height, for forms (e.g. Test / Live, Page / External link).
function RadioCards<TValue extends string>({
  value,
  onValueChange,
  options,
  disabled,
  'aria-labelledby': labelledBy,
  className
}: RadioCardsProps<TValue>) {
  const id = React.useId();
  return (
    <RadioGroup
      aria-labelledby={labelledBy}
      value={value}
      onValueChange={(next) => onValueChange(next as TValue)}
      className={cn('grid w-full grid-cols-2 gap-2', className)}
    >
      {options.map((option) => (
        <Label
          key={option.value}
          htmlFor={`${id}-${option.value}`}
          className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted has-[button:disabled]:cursor-not-allowed has-[button:disabled]:opacity-50 dark:bg-input/30"
        >
          <RadioGroupItem
            value={option.value}
            id={`${id}-${option.value}`}
            disabled={disabled}
          />
          {option.label}
        </Label>
      ))}
    </RadioGroup>
  );
}

export { RadioCards };
