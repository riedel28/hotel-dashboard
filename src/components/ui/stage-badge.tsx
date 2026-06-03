import { Badge, type BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PropertyStage = 'demo' | 'production' | 'staging' | 'template';

type StageBadgeProps = Omit<BadgeProps, 'children' | 'color' | 'variant'> & {
  stage: PropertyStage;
};

const stageBadgeConfig = {
  demo: {
    label: 'Demo',
    color: 'gray'
  },
  production: {
    label: 'Production',
    color: 'emerald'
  },
  staging: {
    label: 'Staging',
    color: 'sky'
  },
  template: {
    label: 'Template',
    color: 'indigo'
  }
} satisfies Record<
  PropertyStage,
  {
    label: string;
    color: BadgeProps['color'];
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
      color={config.color}
      size={size}
      className={cn(
        'shrink-0 rounded-md border border-foreground/10 capitalize',
        className
      )}
      {...props}
    >
      {config.label}
    </Badge>
  );
}
