import { Trans } from '@lingui/react/macro';
import { MoreHorizontalIcon } from 'lucide-react';
import * as React from 'react';

import { buttonVariants } from '@/components/ui/button';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type DataGridRowActionsProps = React.ComponentProps<
  typeof DropdownMenuTrigger
> & {
  label?: React.ReactNode;
};

function DataGridRowActions({
  className,
  label = <Trans>Open menu</Trans>,
  children,
  ...props
}: DataGridRowActionsProps) {
  return (
    <DropdownMenuTrigger
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        // No taller than a badge, so rows with and without a menu are
        // equally tall
        'group flex size-6 data-[state=open]:bg-muted',
        className
      )}
      {...props}
    >
      {children ?? (
        <MoreHorizontalIcon className="size-4 text-muted-foreground" />
      )}
      <span className="sr-only">{label}</span>
    </DropdownMenuTrigger>
  );
}

export { DataGridRowActions };
