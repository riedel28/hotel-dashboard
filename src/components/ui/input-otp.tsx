import { OTPInput, OTPInputContext } from 'input-otp';
import { MinusIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        // `group/otp` is what lets the slots see the invalid state: the flag
        // lands on the hidden <input>, which is a sibling of the slot group
        // but a descendant of this container.
        'cn-input-otp group/otp flex items-center has-disabled:opacity-50',
        containerClassName
      )}
      spellCheck={false}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, placeholderChar, hasFakeCaret, isActive } =
    inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        // Base — mirrors <Input>, minus the height: 44px stays a touch target.
        'relative flex size-11 items-center justify-center rounded-lg border border-input text-sm outline-none transition-colors',
        // Focus: the active cell gets <Input>'s focus-visible treatment.
        'data-[active=true]:z-10 data-[active=true]:border-primary data-[active=true]:shadow-[inset_0_0_0_1px_var(--color-primary)]',
        // Error, on every cell. The active-cell pair is spelled out rather
        // than left to cascade order: it ties with the focus rule above on
        // specificity, and `data-*` sorts later, so focus would win.
        'group-has-aria-invalid/otp:border-destructive group-has-aria-invalid/otp:shadow-[inset_0_0_0_1px_var(--color-destructive)]',
        'group-has-aria-invalid/otp:data-[active=true]:border-destructive group-has-aria-invalid/otp:data-[active=true]:shadow-[inset_0_0_0_1px_var(--color-destructive)]',
        'dark:bg-input/30',
        className
      )}
      {...props}
    >
      {char ?? (
        <span className="text-muted-foreground/60">{placeholderChar}</span>
      )}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
