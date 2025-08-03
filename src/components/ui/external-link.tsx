import { AnchorHTMLAttributes, ReactNode } from 'react';

import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/lib/utils';

interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  showIcon?: boolean;
}

export function ExternalLink({
  href,
  children,
  className,
  variant = 'link',
  showIcon = true,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant, className }),
        'h-0 p-0',
        className
      )}
      {...props}
    >
      {children}
      {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
      {showIcon && ' ↗'}
    </a>
  );
}
