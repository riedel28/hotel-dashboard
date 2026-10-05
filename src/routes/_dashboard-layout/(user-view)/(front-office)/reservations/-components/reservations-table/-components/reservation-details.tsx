import { Trans, useLingui } from '@lingui/react/macro';
import type { ReactNode } from 'react';

import type { CheckinMethod, Guest, Reservation } from '@/api/reservations';
import { CopyButton } from '@/components/ui/copy-button';
import { CountryFlag } from '@/components/ui/country-flag';
import { CurrencyFormatter } from '@/components/ui/currency-formatter';
import { getCountryName } from '@/lib/countries';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/date';

interface ReservationDetailsProps {
  reservation: Reservation;
}

interface DetailSectionProps {
  title: ReactNode;
  children: ReactNode;
}

interface DetailRowProps {
  label: ReactNode;
  children: ReactNode;
  align?: 'center' | 'start';
}

interface DetailValueProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className="min-w-0 space-y-2">
      <h3 className="mb-2.5 text-[13px] leading-5 font-medium text-pretty text-foreground">
        {title}
      </h3>
      <div className="min-w-0 space-y-2">{children}</div>
    </section>
  );
}

function DetailRow({ label, children, align = 'center' }: DetailRowProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 justify-between gap-4 border-b border-border/60 pb-1.5 last:border-b-0 last:pb-0',
        align === 'start' ? 'items-start' : 'items-center'
      )}
    >
      <span className="shrink-0 text-sm leading-5 text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function DetailValue({ children, className, title }: DetailValueProps) {
  return (
    <span
      className={cn(
        'min-w-0 flex-1 text-right text-sm wrap-break-word',
        className
      )}
      title={title}
    >
      {children}
    </span>
  );
}

function EmptyValue({ children }: { children: ReactNode }) {
  return (
    <span className="block min-w-0 flex-1 text-right text-sm text-muted-foreground">
      {children}
    </span>
  );
}

function GuestLine({ guest, locale }: { guest: Guest; locale: string }) {
  const countryName = getCountryName(guest.nationality_code, locale);

  return (
    <div className="flex min-w-0 items-center justify-end gap-2 text-right">
      <CountryFlag
        code={guest.nationality_code}
        title={countryName}
        className="size-4"
        aria-label={countryName}
      />
      <span className="min-w-0 wrap-break-word">
        {guest.last_name}, {guest.first_name}
      </span>
    </div>
  );
}

function CheckinMethodLabel({ method }: { method: CheckinMethod }) {
  switch (method) {
    case 'android':
      return <Trans>Android App</Trans>;
    case 'ios':
      return <Trans>iOS App</Trans>;
    case 'tv':
      return <Trans>TV App</Trans>;
    case 'station':
      return <Trans>Station</Trans>;
    case 'web':
      return <Trans>Web App</Trans>;
  }
}

export function ReservationDetails({ reservation }: ReservationDetailsProps) {
  const { i18n, t } = useLingui();
  const locale = i18n.locale;
  const [primaryGuest, ...fellowTravelers] = reservation.guests;

  return (
    <div className="box-border w-full max-w-[calc(100vw-2rem)] space-y-2 overflow-hidden bg-card px-2 py-2 sm:space-y-3 sm:px-4 sm:py-2.5 lg:max-w-none">
      <div className="space-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h2 className="text-base leading-6 font-medium text-pretty">
            <Trans>Reservation details</Trans>
          </h2>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2">
              <code className="relative rounded-md bg-muted px-2 py-1.5 font-mono text-xs font-medium text-foreground">
                {reservation.booking_nr}
              </code>
              <CopyButton
                text={reservation.booking_nr}
                copyLabel={t`Copy reservation number`}
                copiedLabel={t`Copied reservation number`}
              />
            </span>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 justify-items-stretch gap-x-4 gap-y-3 rounded-md bg-muted/50 p-2.5 sm:grid-cols-2 sm:gap-y-4 sm:p-4 xl:max-w-4xl xl:gap-x-12 2xl:max-w-none 2xl:grid-cols-4 dark:bg-muted">
        <DetailSection title={<Trans>Booking</Trans>}>
          <DetailRow label={<Trans>Reservation Number</Trans>}>
            <DetailValue title={reservation.booking_nr}>
              {reservation.booking_nr}
            </DetailValue>
          </DetailRow>

          <DetailRow label={<Trans>Guest Email</Trans>}>
            {reservation.guest_email ? (
              <DetailValue title={reservation.guest_email}>
                {reservation.guest_email}
              </DetailValue>
            ) : (
              <EmptyValue>
                <Trans>Not provided</Trans>
              </EmptyValue>
            )}
          </DetailRow>

          <DetailRow label={<Trans>Room</Trans>}>
            {reservation.room_name ? (
              <DetailValue title={reservation.room_name}>
                {reservation.room_name}
              </DetailValue>
            ) : (
              <EmptyValue>
                <Trans>Not assigned</Trans>
              </EmptyValue>
            )}
          </DetailRow>
        </DetailSection>

        <DetailSection title={<Trans>Guests</Trans>}>
          <DetailRow label={<Trans>Primary Guest</Trans>} align="start">
            <div className="min-w-0 flex-1 space-y-1 text-sm">
              {primaryGuest ? (
                <GuestLine guest={primaryGuest} locale={locale} />
              ) : (
                <EmptyValue>
                  <Trans>No primary guest</Trans>
                </EmptyValue>
              )}
            </div>
          </DetailRow>

          <DetailRow label={<Trans>Fellow travelers</Trans>} align="start">
            <div className="min-w-0 flex-1 space-y-2 text-sm">
              {fellowTravelers.length === 0 ? (
                <EmptyValue>
                  <Trans>No fellow travelers</Trans>
                </EmptyValue>
              ) : (
                fellowTravelers.map((guest) => (
                  <GuestLine key={guest.id} guest={guest} locale={locale} />
                ))
              )}
            </div>
          </DetailRow>
        </DetailSection>

        <DetailSection title={<Trans>Stay</Trans>}>
          <DetailRow label={<Trans>Arrival Date</Trans>}>
            <DetailValue>
              {formatDate(reservation.booking_from, {
                preset: 'dateTime'
              })}
            </DetailValue>
          </DetailRow>

          <DetailRow label={<Trans>Departure Date</Trans>}>
            <DetailValue>
              {formatDate(reservation.booking_to, {
                preset: 'dateTime'
              })}
            </DetailValue>
          </DetailRow>

          <DetailRow label={<Trans>Check-in via</Trans>}>
            <DetailValue>
              <CheckinMethodLabel method={reservation.check_in_via} />
            </DetailValue>
          </DetailRow>

          <DetailRow label={<Trans>Check-out via</Trans>}>
            <DetailValue>
              <CheckinMethodLabel method={reservation.check_out_via} />
            </DetailValue>
          </DetailRow>
        </DetailSection>

        <DetailSection title={<Trans>Payment</Trans>}>
          <DetailRow label={<Trans>Balance</Trans>}>
            <DetailValue className="tabular-nums">
              <CurrencyFormatter
                value={reservation.balance}
                currency="EUR"
                locale={locale}
              />
            </DetailValue>
          </DetailRow>

          <DetailRow label={<Trans>Received At</Trans>}>
            <DetailValue>
              {formatDate(reservation.received_at, {
                preset: 'dateTime'
              })}
            </DetailValue>
          </DetailRow>

          <DetailRow label={<Trans>Completed At</Trans>}>
            {reservation.completed_at ? (
              <DetailValue>
                {formatDate(reservation.completed_at, {
                  preset: 'dateTime'
                })}
              </DetailValue>
            ) : (
              <EmptyValue>
                <Trans>Not completed</Trans>
              </EmptyValue>
            )}
          </DetailRow>
        </DetailSection>
      </div>
    </div>
  );
}
