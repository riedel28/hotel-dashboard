import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import type { PropertyStage } from 'shared/types/properties';

import { Badge, badgeDotColors, type BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type { PropertyStage };

/** The stages in the order every list of them shows: live ones first. */
export const propertyStages: PropertyStage[] = [
  'production',
  'staging',
  'demo',
  'template'
];

export const stageLabels: Record<PropertyStage, MessageDescriptor> = {
  production: msg`Production`,
  staging: msg`Staging`,
  demo: msg`Demo`,
  template: msg`Template`
};

type StageBadgeProps = Omit<BadgeProps, 'children' | 'color' | 'variant'> & {
  stage: PropertyStage;
};

const stageColors = {
  demo: 'gray',
  production: 'emerald',
  staging: 'sky',
  template: 'indigo'
} satisfies Record<PropertyStage, BadgeProps['color']>;

export function StageBadge({
  stage,
  size = 'xs',
  className,
  ...props
}: StageBadgeProps) {
  const { t } = useLingui();

  return (
    <Badge
      color={stageColors[stage]}
      size={size}
      className={cn('shrink-0 rounded-md', className)}
      {...props}
    >
      {t(stageLabels[stage])}
    </Badge>
  );
}

/** A stage's name after a dot in its badge's color, for pickers and menus. */
export function StageLabel({ stage }: { stage: PropertyStage }) {
  const { t } = useLingui();

  return (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          'size-2 shrink-0 rounded-full',
          badgeDotColors[stageColors[stage]]
        )}
        aria-hidden="true"
      />
      {t(stageLabels[stage])}
    </span>
  );
}
