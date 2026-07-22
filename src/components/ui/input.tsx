import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base
        'h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 outline-none transition-colors',
        // Typography
        'text-base md:text-sm',
        // Placeholder
        'placeholder:font-normal placeholder:text-muted-foreground',
        // File input
        'file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        // Focus
        'focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)]',
        // Error / invalid
        'aria-invalid:border-destructive aria-invalid:shadow-[inset_0_0_0_1px_var(--color-destructive)]',
        // Disabled
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
        // Dark mode
        'dark:bg-input/30 dark:disabled:bg-input/80',
        className
      )}
      {...props}
    />
  );
}

export { Input };
