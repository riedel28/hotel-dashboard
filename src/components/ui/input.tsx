import { Input as InputPrimitive } from '@base-ui/react/input';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        `
        border
        border-input 
        rounded-md 
        h-9 
        px-2.5 py-1
        text-base 
        bg-transparent
        aria-invalid:ring-[1px]
        aria-invalid:focus:outline-destructive
        w-full 
        min-w-0 
        aria-invalid:border-destructive
        dark:aria-invalid:ring-destructive/40  
        dark:aria-invalid:border-destructive/50 
        dark:bg-input/30 
        transition-[color,box-shadow] 
        md:text-sm 
        placeholder:text-muted-foreground 
        focus:outline-2 
        focus:-outline-offset-1 
        focus:outline-primary
        file:h-7 
        file:text-sm 
        file:font-medium 
        file:text-foreground 
        file:inline-flex 
        file:border-0 
        file:bg-transparent 
        disabled:pointer-events-none 
        disabled:cursor-not-allowed 
        disabled:opacity-50`,
        className
      )}
      {...props}
    />
  );
}

export { Input };
