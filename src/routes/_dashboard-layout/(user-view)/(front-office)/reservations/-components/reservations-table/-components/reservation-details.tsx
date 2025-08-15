import type { ReactNode } from 'react';

import type { CheckinMethod, Reservation } from '@/api/reservations';
import { Trans } from '@lingui/react/macro';
import dayjs from 'dayjs';

import { Code } from '@/components/ui/code';
import { CurrencyFormatter } from '@/components/ui/currency-formatter';

interface ReservationDetailsProps {
  reservation: Reservation;
}

const checkinMenthodLabels = new Map<CheckinMethod, ReactNode>([
  ['android', <Trans>Android App</Trans>],
  ['ios', <Trans>iOS App</Trans>],
  ['tv', <Trans>TV App</Trans>],
  ['station', <Trans>Station</Trans>],
  ['web', <Trans>Web App</Trans>]
]);

const getCheckinMethodName = (value: CheckinMethod) =>
  checkinMenthodLabels.get(value) ?? value;

export function ReservationDetails({ reservation }: ReservationDetailsProps) {
  return (
    <div className="space-y-4 px-6 py-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium">
            <Trans>Reservation details</Trans>
          </h2>
          <div className="flex items-center gap-1">
            <Code size="sm" showCopyButton copyText={reservation.booking_nr}>
              {reservation.booking_nr}
            </Code>
          </div>
        </div>
      </div>

      <div className="grid max-w-6xl grid-cols-3 justify-items-stretch gap-x-12 gap-y-3">
        {/* Column 1 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Reservation ID</Trans>
            </span>
            <span className="text-sm">{reservation.id}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Guest Email</Trans>
            </span>
            <span className="text-sm">{reservation.guest_email}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Room</Trans>
            </span>
            <span className="text-sm">{reservation.room_name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Primary Guest</Trans>
            </span>
            <span className="text-sm">{reservation.primary_guest_name}</span>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Arrival Date</Trans>
            </span>
            <span className="text-sm">
              {dayjs(reservation.booking_from).format('DD.MM.YYYY')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Departure Date</Trans>
            </span>
            <span className="text-sm">
              {dayjs(reservation.booking_to).format('DD.MM.YYYY')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Check-in via</Trans>
            </span>
            <span className="text-sm">
              {getCheckinMethodName(reservation.check_in_via)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Check-out via</Trans>
            </span>
            <span className="text-sm">
              {getCheckinMethodName(reservation.check_out_via)}
            </span>
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Balance</Trans>
            </span>
            <span className="text-sm">
              <CurrencyFormatter value={reservation.balance} currency="EUR" />
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Received At</Trans>
            </span>
            <span className="text-sm">
              {dayjs(reservation.received_at).format('DD.MM.YYYY')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Completed At</Trans>
            </span>
            <span className="text-sm">
              {dayjs(reservation.completed_at).format('DD.MM.YYYY')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
