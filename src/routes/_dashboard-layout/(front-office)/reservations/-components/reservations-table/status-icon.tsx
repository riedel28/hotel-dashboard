'use client';

import { ArrowUpRightIcon, CheckIcon, ClockIcon } from 'lucide-react';

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
  done: 'border-emerald-200 bg-emerald-100 text-emerald-600 hover:bg-emerald-100',
  pending:
    'border-orange-200 bg-orange-100 text-orange-600 hover:bg-orange-100',
  started: 'border-sky-200 bg-sky-100 text-sky-600 hover:bg-sky-100'
} as const;

interface StatusBadgeProps extends BadgeProps {
  status: keyof typeof statusMap;
}

export function StatusBadge({ status }: StatusBadgeProps) {
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
      {status}
    </Badge>
  );
}
