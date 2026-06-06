import { Trans } from '@lingui/react/macro';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import type { CheckinMethod, Reservation } from '@/api/reservations';

import { Code } from '@/components/ui/code';
import { CountryFlag } from '@/components/ui/country-flag';
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
  const [primaryGuest, ...fellowTravelers] = reservation.guests;
  const detailRowClassName =
    'flex min-w-0 items-center justify-between gap-4 border-b border-border/60 pb-1.5 last:border-b-0 last:pb-0';
  const detailLabelClassName =
    'shrink-0 text-sm leading-5 text-muted-foreground';
  const detailValueClassName = 'min-w-0 truncate text-right text-sm';

  return (
    <div className="box-border w-full max-w-[calc(100vw-2rem)] space-y-2 overflow-hidden bg-card px-2 py-2 sm:space-y-3 sm:px-4 sm:py-2.5 lg:max-w-none">
      <div className="space-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h2 className="text-base font-medium leading-6">
            <Trans>Reservation details</Trans>
          </h2>
          <div className="min-w-0">
            <Code size="sm" showCopyButton copyText={reservation.booking_nr}>
              {reservation.booking_nr}
            </Code>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 justify-items-stretch gap-x-4 gap-y-3 rounded-xl bg-muted/50 p-2.5 dark:bg-muted sm:grid-cols-2 sm:gap-y-4 sm:p-4 xl:max-w-7xl xl:grid-cols-4 xl:gap-x-8">
        {/* Column 1 */}
        <div className="min-w-0 space-y-2">
          <div className={detailRowClassName}>
            <span className={detailLabelClassName}>
              <Trans>Reservation Number</Trans>
            </span>
            <span className={detailValueClassName}>
              {reservation.booking_nr}
            </span>
          </div>

          <div className={detailRowClassName}>
            <span className={detailLabelClassName}>
              <Trans>Guest Email</Trans>
            </span>
            <span className={detailValueClassName}>
              {reservation.guest_email}
            </span>
          </div>

          <div className={detailRowClassName}>
            <span className={detailLabelClassName}>
              <Trans>Room</Trans>
            </span>
            <span className={detailValueClassName}>
              {reservation.room_name}
            </span>
          </div>
        </div>

        {/* Column 2 */}
        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 items-start justify-between gap-4 border-b border-border/60 pb-1.5 last:border-b-0 last:pb-0">
            <span className={detailLabelClassName}>
              <Trans>Primary Guest</Trans>
            </span>
            <div className="min-w-0 space-y-1 text-sm">
              {primaryGuest ? (
                <div className="flex min-w-0 items-center justify-end gap-2 text-right">
                  <CountryFlag
                    code={primaryGuest.nationality_code}
                    title={primaryGuest.nationality_code}
                    className="size-4"
                    aria-label={primaryGuest.nationality_code}
                  />
                  <span className="min-w-0 truncate">
                    {primaryGuest.last_name}, {primaryGuest.first_name}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  <Trans>No primary guest</Trans>
                </span>
              )}
            </div>
          </div>

          <div className="flex min-w-0 items-start justify-between gap-4 border-b border-border/60 pb-1.5 last:border-b-0 last:pb-0">
            <span className={detailLabelClassName}>
              <Trans>Fellow travelers</Trans>
            </span>
            <div className="min-w-0 space-y-1 text-sm">
              {fellowTravelers.length === 0 ? (
                <span className="text-muted-foreground">
                  <Trans>No fellow travelers</Trans>
                </span>
              ) : (
                fellowTravelers.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex min-w-0 items-center justify-end gap-2 border-b border-border/60 pb-1.5 text-right last:border-b-0 last:pb-0"
                  >
                    <CountryFlag
                      code={guest.nationality_code}
                      title={guest.nationality_code}
                      className="size-4"
                      aria-label={guest.nationality_code}
                    />
                    <span className="min-w-0 truncate">
                      {guest.last_name}, {guest.first_name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 3 */}
        <div className="min-w-0 space-y-2">
          <div className={detailRowClassName}>
            <span className={detailLabelClassName}>
              <Trans>Arrival Date</Trans>
            </span>
            <span className={detailValueClassName}>
              {dayjs(reservation.booking_from).format('DD.MM.YYYY')}
            </span>
          </div>

          <div className={detailRowClassName}>
            <span className={detailLabelClassName}>
              <Trans>Departure Date</Trans>
            </span>
            <span className={detailValueClassName}>
              {dayjs(reservation.booking_to).format('DD.MM.YYYY')}
            </span>
          </div>

          <div className={detailRowClassName}>
            <span className={detailLabelClassName}>
              <Trans>Check-in via</Trans>
            </span>
            <span className={detailValueClassName}>
              {getCheckinMethodName(reservation.check_in_via)}
            </span>
          </div>

          <div className={detailRowClassName}>
            <span className={detailLabelClassName}>
              <Trans>Check-out via</Trans>
            </span>
            <span className={detailValueClassName}>
              {getCheckinMethodName(reservation.check_out_via)}
            </span>
          </div>
        </div>

        {/* Column 4 */}
        <div className="min-w-0 space-y-2">
          <div className={detailRowClassName}>
            <span className={detailLabelClassName}>
              <Trans>Balance</Trans>
            </span>
            <span className={detailValueClassName}>
              <CurrencyFormatter value={reservation.balance} currency="EUR" />
            </span>
          </div>

          <div className={detailRowClassName}>
            <span className={detailLabelClassName}>
              <Trans>Received At</Trans>
            </span>
            <span className={detailValueClassName}>
              {dayjs(reservation.received_at).format('DD.MM.YYYY')}
            </span>
          </div>

          <div className={detailRowClassName}>
            <span className={detailLabelClassName}>
              <Trans>Completed At</Trans>
            </span>
            <span className={detailValueClassName}>
              {dayjs(reservation.completed_at).format('DD.MM.YYYY')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
