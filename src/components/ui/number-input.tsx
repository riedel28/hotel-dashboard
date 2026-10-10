import { NumberField } from '@base-ui-components/react/number-field';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { useId } from 'react';

import { cn } from '@/lib/utils';

const stepperClassName =
  // Inset from the field's border, so the hover reads as a button inside it
  // A translucent tint, not bg-muted: on the field's dark-theme fill muted is all but invisible
  'mx-0.75 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:bg-foreground/10 focus-visible:text-foreground active:translate-y-px active:bg-foreground/15 disabled:pointer-events-none disabled:opacity-50';

function NumberInput({
  className,
  ...props
}: React.ComponentProps<typeof NumberField.Root>) {
  const id = useId();

  return (
    <NumberField.Root
      id={id}
      {...props}
      className={cn('flex flex-col gap-1', className)}
    >
      <NumberField.Group
        className={cn(
          // Base — mirrors <Input>
          'flex h-9 w-full items-center overflow-hidden rounded-lg border border-input bg-transparent transition-colors',
          // Focus
          'focus-within:border-primary focus-within:shadow-[inset_0_0_0_1px_var(--color-primary)]',
          // Error / invalid (inside a <Field data-invalid>)
          'in-data-[invalid=true]:border-danger in-data-[invalid=true]:focus-within:border-danger in-data-[invalid=true]:focus-within:shadow-[inset_0_0_0_1px_var(--color-danger)]',
          // Disabled
          'data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:bg-input/50 data-disabled:opacity-50',
          // Dark mode
          'dark:bg-input/30 dark:data-disabled:bg-input/80'
        )}
      >
        <NumberField.Decrement className={stepperClassName}>
          <MinusIcon className="size-4" />
        </NumberField.Decrement>
        <NumberField.Input className="h-full w-full min-w-0 flex-1 bg-transparent px-2.5 text-center text-base tabular-nums outline-none placeholder:text-muted-foreground md:text-sm" />
        <NumberField.Increment className={stepperClassName}>
          <PlusIcon className="size-4" />
        </NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  );
}

export { NumberInput };
