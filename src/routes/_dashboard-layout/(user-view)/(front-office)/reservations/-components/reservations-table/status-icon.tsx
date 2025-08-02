'use client';

import { ArrowUpRightIcon, CheckIcon, ClockIcon } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import { Badge, BadgeProps } from '@/components/ui/badge';

import { cn } from '@/lib/utils';

type StatusIconProps = {
  status: string;
};

export function StatusIcon({ status }: StatusIconProps) {
  switch (status.toLowerCase()) {
    case 'done':
      return (
        <div className="inline-flex rounded-full bg-green-200 p-1">
          <CheckIcon className="size-3.5 text-green-700" />
        </div>
      );
    case 'pending':
      return (
        <div className="inline-flex rounded-full bg-yellow-200 p-1">
          <ClockIcon className="size-3.5 text-yellow-700" />
        </div>
      );
    case 'started':
      return (
        <div className="inline-flex rounded-full bg-blue-200 p-1">
          <ArrowUpRightIcon className="size-3.5 text-blue-700" />
        </div>
      );
    default:
      return null;
  }
}

const statusMap = {
  done: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-orange-100 text-orange-700',
  started: 'bg-sky-100 text-sky-700'
} as const;

interface StatusBadgeProps extends BadgeProps {
  status: keyof typeof statusMap;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusMessage = () => {
    switch (status) {
      case 'done':
        return (
          <FormattedMessage
            id="reservations.status.done"
            defaultMessage="Done"
          />
        );
      case 'pending':
        return (
          <FormattedMessage
            id="reservations.status.pending"
            defaultMessage="Pending"
          />
        );
      case 'started':
        return (
          <FormattedMessage
            id="reservations.status.started"
            defaultMessage="Started"
          />
        );
      default:
        return status;
    }
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        'text-xxs rounded-md px-1.5 text-xs font-medium capitalize',
        status === 'started' && statusMap['started'],
        status === 'pending' && statusMap['pending'],
        status === 'done' && statusMap['done']
      )}
    >
      {getStatusMessage()}
    </Badge>
  );
}
