import { InfoIcon, Loader2Icon, TriangleAlertIcon } from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

import { useTheme } from '@/components/theme-provider';
import { StatusDisc } from '@/components/ui/status-disc';

// Every toast is a neutral popover; only its icon carries the status colour.
// A tinted fill reads as murky on the dark theme.
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: (
          <StatusDisc
            variant="solid"
            status="success"
            size="sm"
            className="size-4"
          />
        ),
        error: (
          <StatusDisc
            variant="solid"
            status="error"
            size="sm"
            className="size-4"
          />
        ),
        info: <InfoIcon className="size-4 text-info" />,
        warning: <TriangleAlertIcon className="size-4 text-warning" />,
        loading: <Loader2Icon className="size-4 animate-spin" />
      }}
      toastOptions={{
        classNames: { description: 'text-muted-foreground!' }
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)'
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
