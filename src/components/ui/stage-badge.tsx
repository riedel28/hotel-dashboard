import { Badge, type BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PropertyStage = 'demo' | 'production' | 'staging' | 'template';

type StageBadgeProps = Omit<BadgeProps, 'children' | 'variant'> & {
  stage: PropertyStage;
};

const stageBadgeConfig = {
  demo: {
    label: 'Demo',
    variant: 'info',
    className:
      'bg-gray-50 !text-gray-800 dark:bg-gray-800/20 dark:!text-gray-300'
  },
  production: {
    label: 'Production',
    variant: 'success',
    className:
      'bg-emerald-50 !text-emerald-800 dark:bg-emerald-800/20 dark:!text-emerald-300'
  },
  staging: {
    label: 'Staging',
    variant: 'default',
    className: 'bg-sky-50 !text-sky-700 dark:bg-sky-800/20 dark:!text-sky-300'
  },
  template: {
    label: 'Template',
    variant: 'warning',
    className:
      'bg-indigo-50 !text-indigo-800 dark:bg-indigo-800/20 dark:!text-indigo-300'
  }
} satisfies Record<
  PropertyStage,
  {
    label: string;
    variant: BadgeProps['variant'];
    className: string;
  }
>;

export function StageBadge({
  stage,
  size = 'xs',
  className,
  ...props
}: StageBadgeProps) {
  const config = stageBadgeConfig[stage];

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={cn(
        'shrink-0 rounded-md border border-foreground/10 capitalize',
        config.className,
        className
      )}
      {...props}
    >
      {config.label}
    </Badge>
  );
}
