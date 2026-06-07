import { ChevronDownIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';

interface DataGridRadioFilterOption<TValue extends string> {
  value: TValue;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

interface DataGridRadioFilterProps<TValue extends string> extends Omit<
  ButtonProps,
  'children' | 'onChange' | 'value'
> {
  options: DataGridRadioFilterOption<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
  label: ReactNode;
  placeholder?: ReactNode;
  emptyValue?: TValue;
}

function DataGridRadioFilter<TValue extends string>({
  options,
  value,
  onValueChange,
  label,
  placeholder,
  emptyValue,
  className,
  ...props
}: DataGridRadioFilterProps<TValue>) {
  const selectedOption = options.find(option => option.value === value);
  const hasActiveOption = Boolean(
    selectedOption && (!emptyValue || selectedOption.value !== emptyValue)
  );

  const triggerLabel = hasActiveOption ? (
    <Badge
      variant="secondary"
      color="gray"
      size="xs"
      className="rounded-md px-1.5 py-0 leading-5"
    >
      {selectedOption?.label}
    </Badge>
  ) : (
    (placeholder ?? selectedOption?.label)
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton
        render={triggerProps => (
          <Button
            variant="ghost"
            className={cn(
              'hover:bg-background data-popup-open:bg-background inline-flex h-9 min-w-fit items-center justify-between gap-2 border border-input bg-background px-3 py-2 text-sm font-normal whitespace-nowrap hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/30 dark:hover:text-foreground',
              className
            )}
            {...props}
            {...triggerProps}
          >
            <span className="flex min-w-0 items-center gap-2">
              {hasActiveOption && (
                <span className="font-normal text-muted-foreground">
                  {label}
                </span>
              )}
              <span
                className={cn(
                  'truncate',
                  !hasActiveOption && 'text-muted-foreground'
                )}
              >
                {triggerLabel}
              </span>
            </span>
            <ChevronDownIcon className="size-4 opacity-50" />
          </Button>
        )}
      />
      <DropdownMenuContent align="start" className="w-auto">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={nextValue => onValueChange(nextValue as TValue)}
        >
          {options.map(option => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              closeOnClick
              className="py-1.5"
            >
              <span className="flex min-w-0 items-center">
                {option.icon}
                <span className="truncate">{option.label}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export {
  DataGridRadioFilter,
  type DataGridRadioFilterOption,
  type DataGridRadioFilterProps
};
