import { Trans } from '@lingui/react/macro';
import type { PropertyStage } from 'shared/types/properties';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const stageVariantMap: Record<PropertyStage, BadgeProps['variant']> = {
  demo: 'info',
  production: 'success',
  staging: 'default',
  template: 'warning'
};

function getStageMessage(stage: PropertyStage) {
  switch (stage) {
    case 'demo':
      return <Trans>Demo</Trans>;
    case 'production':
      return <Trans>Production</Trans>;
    case 'staging':
      return <Trans>Staging</Trans>;
    case 'template':
      return <Trans>Template</Trans>;
    default:
      return stage;
  }
}

interface StageBadgeProps extends Omit<BadgeProps, 'variant'> {
  stage: PropertyStage;
}

export function StageBadge({
  stage,
  size = 'xs',
  className,
  ...props
}: StageBadgeProps) {
  return (
    <Badge
      variant={stageVariantMap[stage] ?? 'secondary'}
      size={size}
      className={cn(
        'shrink-0 rounded-md border border-foreground/10 capitalize',
        className
      )}
      {...props}
    >
      {getStageMessage(stage)}
    </Badge>
  );
}
