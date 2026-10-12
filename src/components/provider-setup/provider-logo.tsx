import { cn } from '@/lib/utils';

import type { ProviderLogoSource } from './types';

interface ProviderLogoProps {
  logo: ProviderLogoSource;
  /** Drawn without colour, for a provider that cannot be set up yet. */
  muted?: boolean;
  /** Sizes the image, e.g. `max-h-8 max-w-24`. */
  className?: string;
}

/**
 * A provider's logo, legible in both themes. Decorative: the provider's name is
 * always written beside it.
 */
export function ProviderLogo({ logo, muted, className }: ProviderLogoProps) {
  const image = cn('object-contain', className);

  if (muted) {
    // One flat tone whatever the file: grey in the light theme, white in the dark
    return (
      <img
        src={logo.src}
        alt=""
        className={cn(
          image,
          logo.lightInk
            ? 'opacity-60 brightness-0 dark:opacity-100 dark:brightness-100'
            : 'grayscale dark:brightness-0 dark:invert'
        )}
      />
    );
  }

  return (
    <>
      <img
        src={logo.src}
        alt=""
        className={cn(
          image,
          logo.darkSrc && 'dark:hidden',
          logo.lightInk && 'brightness-0 dark:brightness-100'
        )}
      />
      {logo.darkSrc && (
        <img
          src={logo.darkSrc}
          alt=""
          className={cn(image, 'hidden dark:block')}
        />
      )}
    </>
  );
}
