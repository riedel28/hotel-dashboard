import { Switch as SwitchPrimitive } from '@base-ui/react/switch';

import { cn } from '@/lib/utils';

function Switch({
  className,
  size = 'default',
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: 'sm' | 'default';
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'bg-input data-checked:bg-primary aria-checked:bg-primary dark:bg-input/80 dark:data-checked:bg-primary dark:aria-checked:bg-primary aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shrink-0 rounded-full border border-transparent shadow-xs aria-invalid:ring-[3px] data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] peer group/switch relative inline-flex items-center transition-[background-color,border-color,outline-color] outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1 after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="bg-white dark:bg-foreground dark:data-checked:bg-primary-foreground dark:aria-checked:bg-primary-foreground rounded-full group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-checked:translate-x-[calc(100%-2px)] data-unchecked:translate-x-0 pointer-events-none block ring-0 transition-[background-color,transform]"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
