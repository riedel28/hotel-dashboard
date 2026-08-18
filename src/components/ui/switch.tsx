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
        'peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent bg-input shadow-xs transition-[background-color,border-color,outline-color] outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary focus-visible:outline-solid aria-checked:bg-primary aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:bg-input/80 dark:aria-checked:bg-primary dark:aria-invalid:ring-destructive/40 data-checked:bg-primary dark:data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white ring-0 transition-[background-color,transform] group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 dark:bg-foreground dark:aria-checked:bg-primary-foreground data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground data-unchecked:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
