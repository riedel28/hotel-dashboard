import { useLingui } from '@lingui/react/macro';
import { SearchIcon, XIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@/components/ui/input-group';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { cn } from '@/lib/utils';

interface SearchInputProps extends Omit<
  React.ComponentProps<'input'>,
  'onChange' | 'value' | 'type'
> {
  value?: string;
  wrapperClassName?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;
}

export function SearchInput({
  placeholder,
  value = '',
  onChange,
  onClear,
  className = '',
  disabled = false,
  debounceMs,
  wrapperClassName = '',
  ...inputProps
}: SearchInputProps) {
  const { t } = useLingui();
  const [inputValue, setInputValue] = useState(value);

  // Create debounced onChange callback
  const debouncedOnChange = useDebouncedCallback(
    (newValue: string) => onChange?.(newValue),
    debounceMs || 0
  );

  // Create immediate onChange callback
  const immediateOnChange = useCallback(
    (newValue: string) => onChange?.(newValue),
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Use debounced or immediate callback based on debounceMs
    if (debounceMs) {
      debouncedOnChange(newValue);
    } else {
      immediateOnChange(newValue);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange?.('');
    onClear?.();
  };

  return (
    <InputGroup className={cn(wrapperClassName)}>
      <InputGroupAddon align="inline-start">
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={inputValue}
        onChange={handleInputChange}
        disabled={disabled}
        // The native clear button is replaced by our own below.
        className={cn('[&::-webkit-search-cancel-button]:hidden', className)}
        placeholder={placeholder}
        {...inputProps}
      />
      {inputValue && !disabled && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={t`Clear search`}
            className="text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            <XIcon className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
