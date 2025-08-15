/**
 * NotFound Component
 *
 * A reusable 404 not found component that follows the app's design system.
 *
 * @example
 * // Basic not found display
 * <NotFound />
 *
 * @example
 * // Custom not found with specific message
 * <NotFound
 *   title="Reservation not found"
 *   message="The reservation you're looking for doesn't exist"
 *   showBackButton
 *   backButtonText="Back to reservations"
 *   onBack={() => navigate('/reservations')}
 * />
 *
 * @example
 * // Not found with custom actions
 * <NotFound
 *   title="Page not found"
 *   message="The page you're looking for doesn't exist"
 *   showHomeButton
 *   showBackButton
 *   onHome={() => navigate('/')}
 *   onBack={() => navigate(-1)}
 * />
 */
import * as React from 'react';

import { Trans } from '@lingui/react/macro';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { type VariantProps, cva } from 'class-variance-authority';
import { ArrowLeft, Home, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

const notFoundVariants = cva(
  'flex flex-col items-center justify-center rounded-xl border bg-card text-center',
  {
    variants: {
      variant: {
        default: 'border-border',
        destructive: 'border-destructive/10 bg-destructive/5'
      },
      size: {
        sm: 'max-w-md p-8',
        md: 'max-w-lg p-12',
        lg: 'max-w-xl p-16'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

const iconVariants = cva('flex items-center justify-center rounded-full', {
  variants: {
    variant: {
      default: 'bg-muted/50',
      destructive: 'bg-destructive/10 text-destructive'
    },
    size: {
      sm: 'size-10',
      md: 'size-16',
      lg: 'size-20'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'md'
  }
});

const iconSizes = {
  sm: 16,
  md: 32,
  lg: 36
} as const;

export interface NotFoundProps
  extends Omit<React.ComponentProps<'div'>, 'title'>,
    VariantProps<typeof notFoundVariants> {
  title?: React.ReactNode;
  message?: React.ReactNode;
  statusCode?: string | number;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showSearchButton?: boolean;
  homeButtonText?: React.ReactNode;
  backButtonText?: React.ReactNode;
  searchButtonText?: React.ReactNode;
  children?: React.ReactNode;
}

function NotFound({
  className,
  variant = 'default',
  size = 'md',
  title,
  message,
  statusCode = 404,
  showHomeButton = true,
  showBackButton = true,
  showSearchButton = false,
  homeButtonText,
  backButtonText,
  searchButtonText,
  children,
  ...props
}: NotFoundProps) {
  const navigate = useNavigate();
  const router = useRouter();

  const iconSize = iconSizes[size as keyof typeof iconSizes] || 24;

  return (
    <div
      className={cn(notFoundVariants({ variant, size, className }))}
      {...props}
    >
      <div className={cn(iconVariants({ variant, size }), 'mb-8')}>
        <Search size={iconSize} />
      </div>

      {statusCode && (
        <div className="mb-4">
          <Badge variant="outline" className="bg-accent text-xl font-medium">
            {statusCode}
          </Badge>
        </div>
      )}

      {title && (
        <h3 className="mb-2 text-xl font-semibold text-card-foreground">
          {title || <Trans>Page not found</Trans>}
        </h3>
      )}

      {message && (
        <p className="mb-8 text-base leading-relaxed text-card-foreground">
          {message || (
            <Trans>Sorry, we couldn't find the page you're looking for.</Trans>
          )}
        </p>
      )}

      {(showHomeButton || showBackButton || showSearchButton) && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {showBackButton && (
            <Button
              variant="outline"
              onClick={() => router.history.back()}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              {backButtonText || <Trans>Go back</Trans>}
            </Button>
          )}

          {showHomeButton && (
            <Button onClick={() => navigate({ to: '/' })} className="gap-2">
              <Home size={16} />
              {homeButtonText || <Trans>Go home</Trans>}
            </Button>
          )}

          {showSearchButton && (
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/' })}
              className="gap-2"
            >
              <Search size={16} />
              {searchButtonText || <Trans>Search</Trans>}
            </Button>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

export { NotFound, notFoundVariants };
