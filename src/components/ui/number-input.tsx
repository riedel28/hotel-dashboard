import { useId } from 'react';

import { NumberField } from '@base-ui-components/react/number-field';
import { MinusIcon, PlusIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

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
      <NumberField.Group className="flex items-center rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[2px] focus-within:ring-ring/50">
        <NumberField.Decrement className="flex h-9 w-9 items-center justify-center rounded-l-md border-r bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50">
          <MinusIcon className="h-4 w-4" />
        </NumberField.Decrement>
        <NumberField.Input className="w-full min-w-0 flex-1 border-0 bg-transparent px-3 py-1 text-center text-base shadow-none transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
        <NumberField.Increment className="flex h-9 w-9 items-center justify-center rounded-r-md border-l bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50">
          <PlusIcon className="h-4 w-4" />
        </NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  );
}

export { NumberInput };
