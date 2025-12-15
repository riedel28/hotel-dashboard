import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon, CopyIcon } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

import { cn } from '@/lib/utils';

export interface CodeProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof codeVariants> {
  asChild?: boolean;
  showCopyButton?: boolean;
  copyText?: string;
}

const codeVariants = cva(
  'relative rounded-md bg-muted font-mono text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-muted text-foreground',
        destructive: 'bg-destructive/10 text-destructive',
        outline: 'border border-border bg-background text-foreground'
      },
      size: {
        default: 'text-sm px-2.5 py-1.5',
        sm: 'text-xs px-2 py-1.5',
        lg: 'text-base px-3 py-1.5'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

function Code({
  className,
  variant,
  size,
  asChild = false,
  showCopyButton = false,
  copyText,
  children,
  ...props
}: CodeProps) {
  const { copy, copied } = useCopyToClipboard();
  const Comp = asChild ? Slot : 'code';
  const textToCopy = copyText || (typeof children === 'string' ? children : '');

  return (
    <span
      className={cn('inline-flex items-center gap-2', className)}
      data-slot="code"
    >
      <Comp
        data-slot="code-panel"
        className={cn(codeVariants({ variant, size }))}
        {...props}
      >
        {children}
      </Comp>
      {showCopyButton && textToCopy && (
        <Button
          size="sm"
          variant="ghost"
          className="size-4 hover:bg-background"
          onClick={() => copy(textToCopy)}
        >
          {copied ? (
            <CheckIcon className="size-4 text-badge-success-foreground" />
          ) : (
            <CopyIcon className="size-4" />
          )}
        </Button>
      )}
    </span>
  );
}

export { Code, codeVariants };
