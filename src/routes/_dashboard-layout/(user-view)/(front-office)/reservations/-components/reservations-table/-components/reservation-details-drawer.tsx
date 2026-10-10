import { Trans, useLingui } from '@lingui/react/macro';
import type { ReactNode } from 'react';

import type { CheckinMethod, Guest, Reservation } from '@/api/reservations';
import { CopyButton } from '@/components/ui/copy-button';
import { CountryFlag } from '@/components/ui/country-flag';
import { CurrencyFormatter } from '@/components/ui/currency-formatter';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { getCountryName } from '@/lib/countries';
import { formatDate } from '@/utils/date';

import { StatusCell } from './cells/status-cell';

interface ReservationDetailsDrawerProps {
  /** The open reservation; the drawer is closed while undefined. */
  reservation?: Reservation;
  onClose: () => void;
}

export function ReservationDetailsDrawer({
  reservation,
  onClose
}: ReservationDetailsDrawerProps) {
  return (
    <Drawer
      open={reservation !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      <DrawerContent>
        {reservation && <ReservationDetails reservation={reservation} />}
      </DrawerContent>
    </Drawer>
  );
}

function DetailSection({
  title,
  children
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {/* A fixed label column keeps the values aligned across sections */}
      <dl className="grid grid-cols-[9rem_1fr] gap-x-6 gap-y-2 text-sm">
        {children}
      </dl>
    </section>
  );
}

function DetailRow({
  label,
  children
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 wrap-break-word">{children}</dd>
    </>
  );
}

function EmptyValue({ children }: { children: ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>;
}

function GuestLine({ guest, locale }: { guest: Guest; locale: string }) {
  const countryName = getCountryName(guest.nationality_code, locale);

  return (
    <div className="flex min-w-0 items-center gap-2">
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

function CheckinMethodLabel({ method }: { method: CheckinMethod | null }) {
  switch (method) {
    case null:
      return (
        <EmptyValue>
          <Trans>Not yet</Trans>
        </EmptyValue>
      );
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

function ReservationDetails({ reservation }: { reservation: Reservation }) {
  const { i18n, t } = useLingui();
  const locale = i18n.locale;
  const [primaryGuest, ...fellowTravelers] = reservation.guests;

  return (
    <>
      <DrawerHeader className="space-y-2">
        {/* Only the title row shares its line with the close button */}
        <div className="flex items-center gap-2 pr-10">
          <DrawerTitle className="min-w-0 truncate">
            {reservation.booking_nr}
          </DrawerTitle>
          <CopyButton
            text={reservation.booking_nr}
            copyLabel={t`Copy reservation number`}
            copiedLabel={t`Copied reservation number`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm font-normal text-muted-foreground">
          <StatusCell status={reservation.state} />
          {reservation.room_name && <span>{reservation.room_name}</span>}
        </div>
      </DrawerHeader>

      <DrawerBody className="space-y-5">
        <DetailSection title={<Trans>Booking</Trans>}>
          <DetailRow label={<Trans>Guest Email</Trans>}>
            {reservation.guest_email || (
              <EmptyValue>
                <Trans>Not provided</Trans>
              </EmptyValue>
            )}
          </DetailRow>

          <DetailRow label={<Trans>Room</Trans>}>
            {reservation.room_name || (
              <EmptyValue>
                <Trans>Not assigned</Trans>
              </EmptyValue>
            )}
          </DetailRow>
        </DetailSection>

        <DetailSection title={<Trans>Guests</Trans>}>
          <DetailRow label={<Trans>Primary Guest</Trans>}>
            {primaryGuest ? (
              <GuestLine guest={primaryGuest} locale={locale} />
            ) : (
              <EmptyValue>
                <Trans>No primary guest</Trans>
              </EmptyValue>
            )}
          </DetailRow>

          <DetailRow label={<Trans>Fellow travelers</Trans>}>
            {fellowTravelers.length === 0 ? (
              <EmptyValue>
                <Trans>No fellow travelers</Trans>
              </EmptyValue>
            ) : (
              <div className="space-y-2">
                {fellowTravelers.map((guest) => (
                  <GuestLine key={guest.id} guest={guest} locale={locale} />
                ))}
              </div>
            )}
          </DetailRow>
        </DetailSection>

        <DetailSection title={<Trans>Stay</Trans>}>
          <DetailRow label={<Trans>Arrival Date</Trans>}>
            {formatDate(reservation.booking_from, { preset: 'dateTime' })}
          </DetailRow>

          <DetailRow label={<Trans>Departure Date</Trans>}>
            {formatDate(reservation.booking_to, { preset: 'dateTime' })}
          </DetailRow>

          <DetailRow label={<Trans>Check-in via</Trans>}>
            <CheckinMethodLabel method={reservation.check_in_via} />
          </DetailRow>

          <DetailRow label={<Trans>Check-out via</Trans>}>
            <CheckinMethodLabel method={reservation.check_out_via} />
          </DetailRow>
        </DetailSection>

        <DetailSection title={<Trans>Payment</Trans>}>
          <DetailRow label={<Trans>Balance</Trans>}>
            <span className="tabular-nums">
              <CurrencyFormatter
                value={reservation.balance}
                currency="EUR"
                locale={locale}
              />
            </span>
          </DetailRow>

          <DetailRow label={<Trans>Received At</Trans>}>
            {formatDate(reservation.received_at, { preset: 'dateTime' })}
          </DetailRow>

          <DetailRow label={<Trans>Completed At</Trans>}>
            {reservation.completed_at ? (
              formatDate(reservation.completed_at, { preset: 'dateTime' })
            ) : (
              <EmptyValue>
                <Trans>Not completed</Trans>
              </EmptyValue>
            )}
          </DetailRow>
        </DetailSection>
      </DrawerBody>
    </>
  );
}
