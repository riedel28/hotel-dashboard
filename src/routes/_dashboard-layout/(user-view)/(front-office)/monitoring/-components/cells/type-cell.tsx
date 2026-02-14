import { CreditCard, LayoutGrid, Lock } from 'lucide-react';
import { type MonitoringType } from 'shared/types/monitoring';
import { Badge } from '@/components/ui/badge';

interface TypeCellProps {
  type: MonitoringType;
}

const config = {
  pms: {
    icon: LayoutGrid,
    variant: 'info' as const
  },
  payment: {
    icon: CreditCard,
    variant: 'default' as const
  },
  'door lock': {
    icon: Lock,
    variant: 'warning' as const
  }
};

export function TypeCell({ type }: TypeCellProps) {
  const { icon: Icon, variant } = config[type];

  return (
    <Badge
      size="sm"
      variant={variant}
      className="shrink-0 rounded-md flex items-center gap-1.5 border border-foreground/10 capitalize"
    >
      <Icon className="size-3" />
      {type}
    </Badge>
  );
}
