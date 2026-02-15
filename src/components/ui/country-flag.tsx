import { hasFlag } from 'country-flag-icons';
import * as Flags from 'country-flag-icons/react/3x2';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FlagComponent = (
  props: React.HTMLAttributes<HTMLElement & SVGElement>
) => ReactNode;

const flagComponents = Flags as Record<string, FlagComponent>;

interface CountryFlagProps
  extends React.HTMLAttributes<HTMLElement & SVGElement> {
  code: string;
  className?: string;
}

export function CountryFlag({ code, className, ...props }: CountryFlagProps) {
  const upperCode = code.toUpperCase();

  if (!hasFlag(upperCode)) {
    return (
      <span
        className={cn('inline-block rounded-md bg-muted', className)}
        aria-label={props['aria-label'] ?? upperCode}
        title={props.title ?? upperCode}
      />
    );
  }

  const Flag = flagComponents[upperCode];
  if (!Flag) {
    return (
      <span
        className={cn('inline-block rounded-md bg-muted', className)}
        aria-label={props['aria-label'] ?? upperCode}
        title={props.title ?? upperCode}
      />
    );
  }

  return <Flag className={cn('rounded-md', className)} {...props} />;
}
