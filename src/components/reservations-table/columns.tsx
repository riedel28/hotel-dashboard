'use client';

import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { ArrowUpRightIcon, CheckIcon, ClockIcon } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

import { RowActions } from './row-actions';

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

export type Reservation = {
  id: number;
  state: 'pending' | 'started' | 'done';
  booking_nr: string;
  guest_email: string;
  booking_id: string;
  room_name: string;
  booking_from: string;
  primary_guest_name: string;
  last_opened_at: string;
  received_at: string;
  completed_at: string;
  page_url: string;
  balance: number;
};

export const columns: ColumnDef<Reservation>[] = [
  {
    accessorKey: 'state',
    header: 'Status',
    size: 50,
    cell: ({ row }) => {
      const status = row.getValue('state') as Reservation['state'];

      return (
        <div className="flex justify-center">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger role="button" aria-label={status}>
                <StatusIcon status={status} />
              </TooltipTrigger>
              <TooltipContent>
                <span className="capitalize">{status}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    }
  },
  {
    accessorKey: 'booking_nr',
    header: 'Reservation Nr.',
    cell: ({ row }) => (
      <span className="text-nowrap font-medium">
        {row.getValue('booking_nr')}
      </span>
    )
  },
  {
    accessorKey: 'room_name',
    header: 'Room'
  },
  {
    accessorKey: 'booking_from',
    header: 'Arrival',
    cell: ({ row }) => {
      return dayjs(row.original.booking_from).format('DD.MM.YYYY');
    }
  },
  {
    accessorKey: 'primary_guest_name',
    header: 'Primary guest',
    cell: ({ row }) => {
      const [firstName, lastName] = row.original.primary_guest_name.split(' ');
      return `${lastName}, ${firstName}`;
    }
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => {
      const amount = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: row.original.balance % 1 === 0 ? 0 : 2
      }).format(row.original.balance);

      return <div className="text-right">{amount}</div>;
    }
  },
  {
    accessorKey: 'received_at',
    header: 'Received at',
    cell: ({ row }) => {
      return dayjs(row.original.received_at).format('DD.MM.YYYY');
    }
  },
  {
    accessorKey: 'completed_at',
    header: 'Completed at',
    cell: ({ row }) => {
      return dayjs(row.original.completed_at).format('DD.MM.YYYY');
    }
  },
  {
    accessorKey: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <RowActions row={row} />
        </div>
      );
    }
  }
];
