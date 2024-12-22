'use client';

import { ArrowUpRightIcon, CheckIcon, ClockIcon } from 'lucide-react';

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
