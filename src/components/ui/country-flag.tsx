import { hasFlag } from 'country-flag-icons';
import * as Flags from 'country-flag-icons/react/3x2';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type FlagComponent = (
  props: React.HTMLAttributes<HTMLElement & SVGElement>
) => ReactNode;

const flagComponents = Flags as Record<string, FlagComponent>;

// Callers size the flag as a square (`size-4`), but the artwork is 3:2: the
// width is kept and the height follows it, so the corner radius lands on the
// flag itself and not on an empty square around it.
const flagBox = { height: 'auto', aspectRatio: '3 / 2' };

// A hairline around the flag: without it a mostly white flag (Japan) loses its
// shape on a light background.
const flagEdge = 'ring-1 ring-foreground/15';

interface CountryFlagProps extends React.HTMLAttributes<
  HTMLElement & SVGElement
> {
  code: string;
  className?: string;
}

export function CountryFlag({ code, className, ...props }: CountryFlagProps) {
  const upperCode = code.toUpperCase();

  const Flag = hasFlag(upperCode) ? flagComponents[upperCode] : undefined;
  if (!Flag) {
    return (
      <span
        className={cn(
          'inline-block shrink-0 rounded-xs bg-muted',
          flagEdge,
          className
        )}
        style={flagBox}
        aria-label={props['aria-label'] ?? upperCode}
        title={props.title ?? upperCode}
      />
    );
  }

  return (
    <Flag
      className={cn('shrink-0 rounded-xs', flagEdge, className)}
      style={flagBox}
      {...props}
    />
  );
}
