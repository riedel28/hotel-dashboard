import { Trans } from '@lingui/react/macro';
import { ChevronDownIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Button, type ButtonProps } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';

interface DataGridRadioFilterOption<TValue extends string> {
  value: TValue;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

interface DataGridRadioFilterProps<TValue extends string>
  extends Omit<ButtonProps, 'children' | 'onChange' | 'value'> {
  options: DataGridRadioFilterOption<TValue>[];
  value?: TValue;
  onValueChange: (value: TValue | undefined) => void;
  label: ReactNode;
  placeholder?: ReactNode;
  showFooter?: boolean;
  clearLabel?: ReactNode;
}

function DataGridRadioFilter<TValue extends string>({
  options,
  value,
  onValueChange,
  label,
  placeholder,
  showFooter = false,
  clearLabel,
  className,
  ...props
}: DataGridRadioFilterProps<TValue>) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  const triggerLabel = selectedOption?.label ?? placeholder ?? (
    <span>
      <Trans>Select status</Trans>
    </span>
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        nativeButton
        render={(triggerProps) => (
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
              {selectedOption ? (
                <span className="font-normal text-muted-foreground">
                  {label}:
                </span>
              ) : (
                <span className="sr-only">{label}</span>
              )}
              <span
                className={cn(
                  'truncate',
                  !selectedOption && 'text-muted-foreground'
                )}
              >
                {triggerLabel}
              </span>
            </span>
            <ChevronDownIcon className="size-4 opacity-50" />
          </Button>
        )}
      />
      <DropdownMenuContent align="start" className="w-auto min-w-[150px]">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(nextValue) => onValueChange(nextValue as TValue)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              closeOnClick
              className="py-1.5"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {showFooter && (
          <>
            <DropdownMenuSeparator />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-full justify-center px-4 font-normal text-muted-foreground transition-colors hover:text-foreground"
              disabled={!selectedOption}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onValueChange(undefined);
                setOpen(false);
              }}
            >
              {clearLabel ?? <Trans>Reset</Trans>}
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export {
  DataGridRadioFilter,
  type DataGridRadioFilterOption,
  type DataGridRadioFilterProps
};
