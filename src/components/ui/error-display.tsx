/**
 * ErrorDisplay Component
 *
 * A reusable error display component that follows the app's design system.
 *
 * @example
 * // Basic error display
 * <ErrorDisplayError
 *   message="Failed to load data"
 *   showRetry
 *   onRetry={handleRetry}
 * />
 *
 * @example
 * // Warning display
 * <ErrorDisplayWarning
 *   title="Connection Warning"
 *   message="Your connection is unstable"
 * />
 *
 * @example
 * // Custom error with details
 * <ErrorDisplay
 *   variant="destructive"
 *   title="API Error"
 *   statusCode={500}
 *   message="Failed to connect to server"
 *   showDetails
 *   details="Error 500: Internal Server Error"
 *   showRetry
 *   onRetry={handleRetry}
 * />
 *
 * @example
 * // Error with custom status code
 * <ErrorDisplayError
 *   title="Database Error"
 *   statusCode="DB_001"
 *   message="Connection failed"
 *   showRetry
 *   onRetry={handleRetry}
 * />
 */
import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

const errorDisplayVariants = cva(
  'flex flex-col items-center justify-center rounded-xl border bg-card text-center',
  {
    variants: {
      variant: {
        default: 'border-border',
        destructive: 'border-destructive/10 bg-destructive/5',
        warning:
          'border-yellow-200/50 bg-yellow-50/50 dark:border-yellow-800/30 dark:bg-yellow-950/10'
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
      destructive: 'bg-destructive/10 text-destructive',
      warning:
        'bg-yellow-100/80 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
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

export interface ErrorDisplayProps
  extends Omit<React.ComponentProps<'div'>, 'title'>,
    VariantProps<typeof errorDisplayVariants> {
  title?: React.ReactNode;
  message?: React.ReactNode;
  statusCode?: string | number;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  showRetry?: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
  showDetails?: boolean;
  details?: React.ReactNode;
}

function ErrorDisplay({
  className,
  variant = 'destructive',
  size = 'md',
  title,
  message,
  statusCode,
  icon: Icon = X,
  showRetry = false,
  onRetry,
  isRetrying = false,
  showDetails = false,
  details,
  children,
  ...props
}: ErrorDisplayProps) {
  const iconSize = iconSizes[size as keyof typeof iconSizes] || 24;

  return (
    <div
      className={cn(errorDisplayVariants({ variant, size }), className)}
      {...props}
    >
      <div className={cn(iconVariants({ variant, size }), 'mb-8')}>
        <Icon size={iconSize} />
      </div>

      {statusCode && (
        <div className="mb-4">
          <Badge variant="outline" className="bg-accent text-xl font-medium">
            {statusCode}
          </Badge>
        </div>
      )}

      {title && (
        <h3 className="text-card-foreground mb-2 text-xl font-semibold">
          {title}
        </h3>
      )}

      {message && (
        <p className="text-card-foreground mb-8 text-base leading-relaxed">
          {message}
        </p>
      )}

      {showDetails && details && (
        <details className="mb-8 w-full text-left">
          <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-medium transition-colors">
            <FormattedMessage
              id="error.showDetails"
              defaultMessage="Show details"
            />
          </summary>
          <div className="bg-muted/80 text-foreground mt-2 rounded-md border p-3 font-mono text-sm leading-relaxed">
            {details}
          </div>
        </details>
      )}

      {children}

      {showRetry && onRetry && (
        <Button
          variant="destructive"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-8"
        >
          <RefreshCw
            className={cn('mr-2 h-4 w-4', isRetrying && 'animate-spin')}
          />
          <FormattedMessage id="error.retry" defaultMessage="Try again" />
        </Button>
      )}
    </div>
  );
}

// Convenience components for common error types
function ErrorDisplayError({
  title,
  message,
  ...props
}: Omit<ErrorDisplayProps, 'variant' | 'icon'>) {
  return (
    <ErrorDisplay
      variant="destructive"
      icon={X}
      title={
        title || (
          <FormattedMessage
            id="error.title"
            defaultMessage="Something went wrong"
          />
        )
      }
      message={message}
      {...props}
    />
  );
}

function ErrorDisplayWarning({
  title,
  message,
  ...props
}: Omit<ErrorDisplayProps, 'variant' | 'icon'>) {
  return (
    <ErrorDisplay
      variant="warning"
      icon={AlertTriangle}
      title={
        title || (
          <FormattedMessage id="error.warning" defaultMessage="Warning" />
        )
      }
      message={message}
      {...props}
    />
  );
}

export { ErrorDisplay, ErrorDisplayError, ErrorDisplayWarning };
