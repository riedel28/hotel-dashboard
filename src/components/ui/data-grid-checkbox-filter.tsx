import { Plural, Trans } from '@lingui/react/macro';
import { ChevronDownIcon } from 'lucide-react';
import { createContext, type ReactNode, use } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface DataGridCheckboxFilterOption<TValue extends string> {
  value: TValue;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

/**
 * Selection state, metadata and actions shared with the footer parts. Keeping
 * the contract free of the option list lets the parts stay agnostic of how the
 * selection is stored.
 */
interface DataGridCheckboxFilterContextValue {
  selectedCount: number;
  selectableCount: number;
  clear: () => void;
  selectAll: () => void;
}

const DataGridCheckboxFilterContext =
  createContext<DataGridCheckboxFilterContextValue | null>(null);

function useDataGridCheckboxFilter() {
  const context = use(DataGridCheckboxFilterContext);

  if (!context) {
    throw new Error(
      'DataGridCheckboxFilter parts must be rendered inside <DataGridCheckboxFilter>'
    );
  }

  return context;
}

interface DataGridCheckboxFilterProps<TValue extends string> extends Omit<
  ButtonProps,
  'children' | 'onChange' | 'value'
> {
  options: DataGridCheckboxFilterOption<TValue>[];
  value: TValue[];
  onValueChange: (value: TValue[]) => void;
  label: ReactNode;
  placeholder?: ReactNode;
  /** Footer parts rendered below the options, e.g. clear / select all. */
  children?: ReactNode;
}

const triggerClassName =
  'hover:bg-background data-popup-open:bg-background inline-flex h-9 min-w-fit items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-normal whitespace-nowrap hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/30 dark:hover:text-foreground';

const footerActionClassName =
  'h-7 flex-1 justify-center px-2 font-normal whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground';

const chevron = <ChevronDownIcon className="size-4 shrink-0 opacity-50" />;

function DataGridCheckboxFilter<TValue extends string>({
  options,
  value,
  onValueChange,
  label,
  placeholder,
  children,
  className,
  ...props
}: DataGridCheckboxFilterProps<TValue>) {
  const selectedValues = new Set<string>(value);
  const selectedOptions = options.filter((option) =>
    selectedValues.has(option.value)
  );
  const selectableOptions = options.filter((option) => !option.disabled);
  const hasSelection = selectedOptions.length > 0;

  const toggleValue = (optionValue: TValue, checked: boolean) => {
    const nextSelectedValues = new Set<string>(value);

    if (checked) {
      nextSelectedValues.add(optionValue);
    } else {
      nextSelectedValues.delete(optionValue);
    }

    // Emit in option order so that the same selection always produces the same
    // array — callers persisting it (URL search params, query keys) would
    // otherwise thrash on click order alone.
    onValueChange(
      options
        .filter((option) => nextSelectedValues.has(option.value))
        .map((option) => option.value)
    );
  };

  const filterContext: DataGridCheckboxFilterContextValue = {
    selectedCount: selectedOptions.length,
    selectableCount: selectableOptions.length,
    clear: () => onValueChange([]),
    selectAll: () => onValueChange(selectableOptions.map((o) => o.value))
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton
        render={(triggerProps) => (
          <Button
            variant="ghost"
            className={cn(triggerClassName, className)}
            {...props}
            {...triggerProps}
          >
            <span className="flex min-w-0 items-center gap-2">
              {hasSelection ? (
                <>
                  <span className="font-normal text-muted-foreground">
                    {label}
                  </span>
                  <Badge
                    variant="secondary"
                    color="gray"
                    size="xs"
                    className="min-w-0 rounded-md px-1.5 py-0 leading-5"
                  >
                    <span className="truncate">
                      {selectedOptions.length === 1 ? (
                        selectedOptions[0]?.label
                      ) : (
                        <Plural
                          value={selectedOptions.length}
                          one="# selected"
                          other="# selected"
                        />
                      )}
                    </span>
                  </Badge>
                </>
              ) : (
                <>
                  <span className="sr-only">{label}</span>
                  <span className="truncate text-muted-foreground">
                    {placeholder ?? <Trans>Select</Trans>}
                  </span>
                </>
              )}
            </span>
            {chevron}
          </Button>
        )}
      />
      <DropdownMenuContent
        align="start"
        className="w-auto min-w-(--anchor-width)"
      >
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues.has(option.value)}
            disabled={option.disabled}
            onCheckedChange={(checked) => toggleValue(option.value, checked)}
            className="py-1.5"
          >
            <span className="-ml-0.5 flex min-w-0 items-center gap-2">
              {option.icon}
              <span className="truncate">{option.label}</span>
            </span>
          </DropdownMenuCheckboxItem>
        ))}
        <DataGridCheckboxFilterContext value={filterContext}>
          {children}
        </DataGridCheckboxFilterContext>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DataGridCheckboxFilterFooter({ children }: { children: ReactNode }) {
  return (
    <>
      <DropdownMenuSeparator />
      <div className="flex items-center gap-1.5">{children}</div>
    </>
  );
}

/** Divider between two footer actions. Purely decorative. */
function DataGridCheckboxFilterFooterSeparator() {
  return <Separator orientation="vertical" className="h-4" />;
}

/**
 * A footer action stays in the menu's keyboard navigation, so it must be a menu
 * item rather than a plain button — and it must not close the menu.
 */
function FooterAction({
  disabled,
  onClick,
  children
}: {
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <DropdownMenuItem
      closeOnClick={false}
      disabled={disabled}
      onClick={onClick}
      className={footerActionClassName}
    >
      {children}
    </DropdownMenuItem>
  );
}

function DataGridCheckboxFilterClear({ children }: { children?: ReactNode }) {
  const { selectedCount, clear } = useDataGridCheckboxFilter();

  return (
    <FooterAction disabled={selectedCount === 0} onClick={clear}>
      {children ?? <Trans>Clear all</Trans>}
    </FooterAction>
  );
}

function DataGridCheckboxFilterSelectAll({
  children
}: {
  children?: ReactNode;
}) {
  const { selectedCount, selectableCount, selectAll } =
    useDataGridCheckboxFilter();

  return (
    <FooterAction
      disabled={selectedCount >= selectableCount}
      onClick={selectAll}
    >
      {children ?? <Trans>Select all</Trans>}
    </FooterAction>
  );
}

export {
  DataGridCheckboxFilter,
  DataGridCheckboxFilterClear,
  DataGridCheckboxFilterFooter,
  DataGridCheckboxFilterFooterSeparator,
  type DataGridCheckboxFilterOption,
  type DataGridCheckboxFilterProps,
  DataGridCheckboxFilterSelectAll
};
