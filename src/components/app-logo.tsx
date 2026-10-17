import { ConciergeBellIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

const sizes = {
  sm: 'size-6.5 rounded-md [&>svg]:size-4',
  lg: 'size-10 rounded-lg [&>svg]:size-5.5'
};

// Solid where the mark is the focus (sign-in pages), where it also sets it
// apart from the tinted step icons there; a quiet tint in the app chrome,
// so it doesn't compete with primary buttons and the active nav item.
const tones = {
  solid: 'bg-primary text-primary-foreground',
  // The active sidebar item's colours, so the mark reads as one with it
  tint: 'bg-primary/10 text-cyan-800 dark:bg-primary/20 dark:text-cyan-200/90'
};

interface AppLogoProps {
  size?: keyof typeof sizes;
  tone?: keyof typeof tones;
  className?: string;
}

/** The product mark: a concierge bell on a primary tile. */
export function AppLogo({
  size = 'sm',
  tone = 'tint',
  className
}: AppLogoProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center',
        sizes[size],
        tones[tone],
        className
      )}
    >
      <ConciergeBellIcon aria-hidden="true" />
    </div>
  );
}
