import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base
        'flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-2.5 py-2 outline-none transition-[color,box-shadow]',
        // Typography
        'text-base md:text-sm',
        // Placeholder
        'placeholder:text-muted-foreground',
        // Focus
        'focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)]',
        // Error / invalid
        'aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:shadow-[inset_0_0_0_1px_var(--color-destructive)]',
        // Disabled
        'disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
        // Dark mode
        'dark:bg-input/30',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
