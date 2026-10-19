import { MessageCircleIcon } from 'lucide-react';

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
  // The active nav item's --primary-soft, so the mark reads as one with it
  tint: 'border border-primary/10 bg-primary-soft text-primary-soft-foreground dark:border-primary/30'
};

interface AppLogoProps {
  size?: keyof typeof sizes;
  tone?: keyof typeof tones;
  className?: string;
}

/** The product mark: a speech bubble on a primary tile. */
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
      <MessageCircleIcon aria-hidden="true" />
    </div>
  );
}
