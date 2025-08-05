import { useCallback, useState } from 'react';

import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { type VariantProps } from 'class-variance-authority';
import { Search } from 'lucide-react';

import { Input, InputWrapper, inputVariants } from '@/components/ui/input';

import { cn } from '@/lib/utils';

interface SearchInputProps
  extends Omit<
    React.ComponentProps<'input'> & VariantProps<typeof inputVariants>,
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
  className = '',
  disabled = false,
  variant,
  debounceMs,
  wrapperClassName = '',
  ...inputProps
}: SearchInputProps) {
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

  return (
    <InputWrapper className={cn(wrapperClassName)}>
      <Search />
      <Input
        type="search"
        value={inputValue}
        onChange={handleInputChange}
        disabled={disabled}
        variant={variant}
        className={cn('pl-8', className)}
        placeholder={placeholder}
        {...inputProps}
      />
    </InputWrapper>
  );
}
