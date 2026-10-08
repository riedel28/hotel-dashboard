import { useLingui } from '@lingui/react/macro';
import { SearchIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

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

  // The text is local so typing stays instant while `onChange` is debounced.
  // It follows `value` only when that changes from outside (a filter reset,
  // Back/Forward): a value that is just our own change coming back must not
  // overwrite what was typed since.
  const [lastEmitted, setLastEmitted] = useState(value);
  const [seenValue, setSeenValue] = useState(value);
  if (value !== seenValue) {
    setSeenValue(value);
    if (value !== lastEmitted) {
      setInputValue(value);
    }
  }

  const emit = (newValue: string) => {
    setLastEmitted(newValue);
    onChange?.(newValue);
  };
  const debouncedEmit = useDebouncedCallback(emit, debounceMs || 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (debounceMs) {
      debouncedEmit(newValue);
    } else {
      emit(newValue);
    }
  };

  const handleClear = () => {
    setInputValue('');
    emit('');
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
