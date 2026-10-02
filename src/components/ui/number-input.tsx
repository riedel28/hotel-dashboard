import { NumberField } from '@base-ui-components/react/number-field';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { useId } from 'react';

import { cn } from '@/lib/utils';

const stepperClassName =
  'flex h-full w-9 shrink-0 items-center justify-center text-muted-foreground transition-colors outline-none first:border-r last:border-l border-input hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground disabled:pointer-events-none disabled:opacity-50';

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
          'in-data-[invalid=true]:border-destructive in-data-[invalid=true]:shadow-[inset_0_0_0_1px_var(--color-destructive)]',
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
