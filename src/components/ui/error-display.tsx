/**
 * ErrorDisplay Component (Compound Components)
 *
 * A reusable error display component that follows the app's design system.
 * Use it with the provided subcomponents for full control.
 *
 * @example
 * // Compound usage
 * <ErrorDisplay variant="destructive">
 *   <ErrorDisplay.Icon icon={XIcon} />
 *   <ErrorDisplay.Status value={500} />
 *   <ErrorDisplay.Title>API Error</ErrorDisplay.Title>
 *   <ErrorDisplay.Message>Failed to connect to server</ErrorDisplay.Message>
 *   <ErrorDisplay.Details>
 *     Error 500: Internal Server Error
 *   </ErrorDisplay.Details>
 *   <ErrorDisplay.Actions>
 *     <ErrorDisplay.RetryButton onRetry={handleRetry} />
 *   </ErrorDisplay.Actions>
 * </ErrorDisplay>
 *
 */
import * as React from 'react';

import { Trans } from '@lingui/react/macro';
import { type VariantProps, cva } from 'class-variance-authority';
import { RefreshCwIcon, XIcon } from 'lucide-react';

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

type ErrorDisplayContextType = {
  variant: NonNullable<VariantProps<typeof errorDisplayVariants>['variant']>;
  size: NonNullable<VariantProps<typeof errorDisplayVariants>['size']>;
};

const ErrorDisplayContext = React.createContext<ErrorDisplayContextType | null>(
  null
);

function useErrorDisplayContext(): ErrorDisplayContextType {
  const ctx = React.useContext(ErrorDisplayContext);
  if (!ctx) {
    throw new Error(
      'useErrorDisplayContext must be used within an <ErrorDisplay> root'
    );
  }
  return ctx;
}

export interface ErrorDisplayProps
  extends Omit<React.ComponentProps<'div'>, 'title'>,
    VariantProps<typeof errorDisplayVariants> {}

function ErrorDisplay({
  className,
  variant = 'destructive',
  size = 'md',
  children,
  ...props
}: ErrorDisplayProps) {
  // Ensure non-nullable values for context
  const safeVariant = (variant ?? 'destructive') as NonNullable<
    VariantProps<typeof errorDisplayVariants>['variant']
  >;
  const safeSize = (size ?? 'md') as NonNullable<
    VariantProps<typeof errorDisplayVariants>['size']
  >;
  return (
    <ErrorDisplayContext.Provider
      value={{ variant: safeVariant, size: safeSize }}
    >
      <div
        data-slot="error-display"
        className={cn(
          errorDisplayVariants({ variant: safeVariant, size: safeSize }),
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ErrorDisplayContext.Provider>
  );
}

type ErrorDisplayIconProps = {
  icon?: React.ComponentType<{ className?: string; size?: number }>;
} & React.HTMLAttributes<HTMLDivElement>;

function ErrorDisplayIcon({
  icon: Icon = XIcon,
  className,
  ...props
}: ErrorDisplayIconProps) {
  const { variant, size } = useErrorDisplayContext();
  const computedIconSize = iconSizes[size as keyof typeof iconSizes] || 24;

  return (
    <Icon
      data-slot="error-display-icon"
      size={computedIconSize}
      className={cn(iconVariants({ variant, size }), 'mb-8', className)}
      {...props}
    />
  );
}

type ErrorDisplayStatusProps = {
  value?: string | number;
} & React.HTMLAttributes<HTMLDivElement>;

function ErrorDisplayStatus({
  className,
  children,
  ...props
}: ErrorDisplayStatusProps) {
  return (
    <Badge
      data-slot="error-display-status"
      variant="outline"
      className={cn('bg-accent text-xl font-medium', className)}
      {...props}
    >
      {children}
    </Badge>
  );
}

function ErrorDisplayTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="error-display-title"
      className={cn(
        'text-card-foreground mb-2 text-xl font-semibold',
        className
      )}
      {...props}
    />
  );
}

function ErrorDisplayMessage({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="error-display-message"
      className={cn(
        'text-card-foreground mb-8 text-base leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

type ErrorDisplayDetailsProps = {
  summaryLabel?: React.ReactNode;
} & React.DetailsHTMLAttributes<HTMLDetailsElement>;

function ErrorDisplayDetails({
  summaryLabel,
  className,
  children,
  ...props
}: ErrorDisplayDetailsProps) {
  return (
    <details
      data-slot="error-display-details"
      className={cn('mb-8 w-full text-left', className)}
      {...props}
    >
      <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-medium transition-colors">
        {summaryLabel ?? <Trans>Show details</Trans>}
      </summary>
      <div className="bg-muted/80 text-foreground mt-2 rounded-md border p-3 font-mono text-sm leading-relaxed">
        {children}
      </div>
    </details>
  );
}

function ErrorDisplayActions({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="error-display-actions"
      className={cn('mt-8', className)}
      {...props}
    />
  );
}

type ErrorDisplayRetryButtonProps = {
  onRetry: () => void;
  isRetrying?: boolean;
  children?: React.ReactNode;
} & Omit<React.ComponentProps<typeof Button>, 'onClick' | 'children'>;

function ErrorDisplayRetryButton({
  onRetry,
  isRetrying,
  children,
  className,
  ...props
}: ErrorDisplayRetryButtonProps) {
  const retrying = isRetrying ?? false;
  return (
    <Button
      data-slot="error-display-retry-button"
      variant="destructive"
      onClick={onRetry}
      disabled={retrying}
      className={cn('mt-8', className)}
      {...props}
    >
      <RefreshCwIcon
        className={cn('mr-2 h-4 w-4', retrying && 'animate-spin')}
      />
      {children ?? <Trans>Try again</Trans>}
    </Button>
  );
}

// Convenience components for common error types
type ErrorDisplayErrorProps = React.ComponentProps<typeof ErrorDisplay> & {
  statusCode?: string | number;
  details?: React.ReactNode;
  showDetails?: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
  showRetry?: boolean;
};

function ErrorDisplayError({ children, ...props }: ErrorDisplayErrorProps) {
  return (
    <ErrorDisplay variant="destructive" {...props}>
      {children}
    </ErrorDisplay>
  );
}

export {
  ErrorDisplay,
  // subcomponents
  ErrorDisplayIcon,
  ErrorDisplayStatus,
  ErrorDisplayTitle,
  ErrorDisplayMessage,
  ErrorDisplayDetails,
  ErrorDisplayActions,
  ErrorDisplayRetryButton,
  // convenience wrappers
  ErrorDisplayError
};
