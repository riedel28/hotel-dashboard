import { CreditCard, LayoutGrid, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type MonitoringType } from 'shared/types/monitoring';

interface TypeCellProps {
  type: MonitoringType;
}

const config = {
  pms: {
    icon: LayoutGrid,
    variant: 'secondary' as const
  },
  payment: {
    icon: CreditCard,
    variant: 'info' as const
  },
  'door lock': {
    icon: Lock,
    variant: 'warning' as const
  }
};

export function TypeCell({ type }: TypeCellProps) {
  const { icon: Icon, variant } = config[type];

  return (
    <Badge variant={variant} size="sm" className="gap-1.5 capitalize">
      <Icon className="size-3" />
      {type}
    </Badge>
  );
}
