import { Link as RouterLink } from '@tanstack/react-router';
import type * as React from 'react';

import { cn } from '@/lib/utils';

// Shared with plain anchors (downloads, external pages) that should look alike
const linkClassName =
  'rounded-sm text-sm font-normal text-link underline-offset-4 outline-none hover:underline focus-visible:shadow-[0_0_0_2px_var(--color-primary)]';

function Link({
  className,
  ...props
}: React.ComponentProps<typeof RouterLink>) {
  return <RouterLink className={cn(linkClassName, className)} {...props} />;
}

export { Link, linkClassName };
