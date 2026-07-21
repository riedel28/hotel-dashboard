import { Trans } from '@lingui/react/macro';
import { ChevronDownIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';
import { Separator } from './separator';

interface DataGridCheckboxFilterOption<TValue extends string> {
  value: TValue;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

interface DataGridCheckboxFilterProps<TValue extends string>
  extends Omit<ButtonProps, 'children' | 'onChange' | 'value'> {
  options: DataGridCheckboxFilterOption<TValue>[];
  value: TValue[];
  onValueChange: (value: TValue[]) => void;
  label: ReactNode;
  placeholder?: ReactNode;
  allLabel?: ReactNode;
  showFooter?: boolean;
  clearAllLabel?: ReactNode;
  selectAllLabel?: ReactNode;
}

function DataGridCheckboxFilter<TValue extends string>({
  options,
  value,
  onValueChange,
  label,
  placeholder,
  allLabel,
  showFooter = false,
  clearAllLabel,
  selectAllLabel,
  className,
  ...props
}: DataGridCheckboxFilterProps<TValue>) {
  const selectedValues = new Set(value);
  const selectedOptions = options.filter((option) =>
    selectedValues.has(option.value)
  );

  const toggleValue = (optionValue: TValue, checked: boolean) => {
    const nextSelectedValues = new Set(value);

    if (checked) {
      nextSelectedValues.add(optionValue);
    } else {
      nextSelectedValues.delete(optionValue);
    }

    onValueChange(Array.from(nextSelectedValues));
  };

  const selectableValues = options
    .filter((option) => !option.disabled)
    .map((option) => option.value);
  const hasSelectedOptions = selectedOptions.length > 0;

  const triggerLabel =
    selectedOptions.length === 0 ? (
      (placeholder ??
      allLabel ?? (
        <span>
          <Trans>Select status</Trans>
        </span>
      ))
    ) : selectedOptions.length === 1 ? (
      <Badge
        variant="secondary"
        color="gray"
        size="xs"
        className="rounded-md px-1.5 py-0 leading-5"
      >
        {selectedOptions[0]?.label}
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        color="gray"
        size="xs"
        className="rounded-md px-1.5 py-0 leading-5"
      >
        <Trans>{selectedOptions.length} selected</Trans>
      </Badge>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton
        render={(triggerProps) => (
          <Button
            variant="ghost"
            className={cn(
              'hover:bg-background data-popup-open:bg-background inline-flex h-9 min-w-fit items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-normal whitespace-nowrap hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/30 dark:hover:text-foreground',
              className
            )}
            {...props}
            {...triggerProps}
          >
            <span className="flex min-w-0 items-center gap-2">
              {hasSelectedOptions && (
                <span className="font-normal text-muted-foreground">
                  {label}
                </span>
              )}
              <span
                className={cn(
                  'truncate',
                  !hasSelectedOptions && 'text-muted-foreground'
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
        {options.map((option) => {
          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedValues.has(option.value)}
              disabled={option.disabled}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) =>
                toggleValue(option.value, Boolean(checked))
              }
              className="py-1.5"
            >
              <span className="flex min-w-0 -ml-0.5 items-center">
                {option.icon}
                <span className="truncate">{option.label}</span>
              </span>
            </DropdownMenuCheckboxItem>
          );
        })}
        {showFooter && (
          <>
            <DropdownMenuSeparator />
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-center h-7 px-4 flex-1 font-normal text-muted-foreground hover:text-foreground transition-colors"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onValueChange([]);
                }}
              >
                {clearAllLabel ?? <Trans>Clear all</Trans>}
              </Button>
              <Separator orientation="vertical" className="h-4 mt-1.5" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-center h-7 px-4 flex-1 font-normal text-muted-foreground hover:text-foreground transition-colors"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onValueChange(selectableValues);
                }}
              >
                {selectAllLabel ?? <Trans>Select all</Trans>}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export {
  DataGridCheckboxFilter,
  type DataGridCheckboxFilterOption,
  type DataGridCheckboxFilterProps
};
