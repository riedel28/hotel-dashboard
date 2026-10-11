import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * The box every field shares: size, border, focus, error and disabled states.
 * `<Input>` adds its typography; controls that are not an input take this (or
 * `fieldTriggerClassName`) so they cannot drift from it.
 */
const fieldBoxClassName = cn(
  // Base
  'h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 transition-colors outline-none',
  // Focus
  'focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)]',
  // Error / invalid
  'aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:shadow-[inset_0_0_0_1px_var(--color-danger)]',
  // Disabled
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
  // Dark mode
  'dark:bg-input/30 dark:disabled:bg-input/80'
);

/**
 * A button that opens a popup (a picker, a calendar) and sits in a form like a
 * field. It stays focused-looking while its popup is open, and also shows an
 * error from an enclosing `<Field data-invalid>`: not every caller passes
 * `aria-invalid`.
 */
const fieldTriggerClassName = cn(
  fieldBoxClassName,
  'flex items-center justify-between gap-2 overflow-hidden text-left text-sm',
  'data-popup-open:border-primary data-popup-open:shadow-[inset_0_0_0_1px_var(--color-primary)]',
  'aria-invalid:data-popup-open:border-danger aria-invalid:data-popup-open:shadow-[inset_0_0_0_1px_var(--color-danger)]',
  'in-data-[invalid=true]:border-danger in-data-[invalid=true]:focus-visible:border-danger in-data-[invalid=true]:focus-visible:shadow-[inset_0_0_0_1px_var(--color-danger)] in-data-[invalid=true]:data-popup-open:border-danger in-data-[invalid=true]:data-popup-open:shadow-[inset_0_0_0_1px_var(--color-danger)]'
);

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldBoxClassName,
        // Typography
        'text-base md:text-sm',
        // Placeholder
        'placeholder:font-normal placeholder:text-muted-foreground',
        // File input
        'file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        className
      )}
      {...props}
    />
  );
}

export { fieldBoxClassName, fieldTriggerClassName, Input };
