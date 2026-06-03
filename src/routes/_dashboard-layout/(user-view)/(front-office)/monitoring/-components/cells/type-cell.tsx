import { CreditCard, LayoutGrid, Lock, type LucideIcon } from 'lucide-react';
import { type MonitoringType } from 'shared/types/monitoring';
import { Badge, type BadgeColorProps } from '@/components/ui/badge';

interface TypeCellProps {
  type: MonitoringType;
}

const config: Record<
  MonitoringType,
  { icon: LucideIcon; color: BadgeColorProps }
> = {
  pms: {
    icon: LayoutGrid,
    color: 'indigo' as const
  },
  payment: {
    icon: CreditCard,
    color: 'sky' as const
  },
  'door lock': {
    icon: Lock,
    color: 'fuchsia' as const
  }
};

export function TypeCell({ type }: TypeCellProps) {
  const { icon: Icon, color } = config[type];

  return (
    <Badge
      size="sm"
      color={color}
      className="shrink-0 rounded-md flex items-center gap-1.5 border border-foreground/10 capitalize"
    >
      <Icon className="size-3" />
      {type}
    </Badge>
  );
}
