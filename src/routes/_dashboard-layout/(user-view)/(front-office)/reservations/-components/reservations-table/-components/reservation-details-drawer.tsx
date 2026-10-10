import { Trans, useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  GlobeIcon,
  MessageSquareDotIcon,
  MonitorIcon,
  PencilIcon,
  Trash2Icon,
  TvIcon
} from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import type { CheckinMethod, Guest, Reservation } from '@/api/reservations';
import { AndroidIcon, AppleIcon } from '@/components/ui/brand-icons';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { CountryFlag } from '@/components/ui/country-flag';
import { CurrencyFormatter } from '@/components/ui/currency-formatter';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { getCountryName } from '@/lib/countries';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/date';

import { DeleteDialog } from '../delete-dialog';
import { StatusCell } from './cells/status-cell';

interface ReservationDetailsDrawerProps {
  /** The open reservation; the drawer is closed while it is not on the page. */
  reservationId?: number;
  /** Reservations of the current table page: the content and ↑/↓ navigation. */
  pageReservations: Reservation[];
  onSelect: (reservationId: number) => void;
  onClose: () => void;
}

export function ReservationDetailsDrawer({
  reservationId,
  pageReservations,
  onSelect,
  onClose
}: ReservationDetailsDrawerProps) {
  const index = pageReservations.findIndex(
    (reservation) => reservation.id === reservationId
  );
  const reservation = pageReservations[index];
  const popupRef = useRef<HTMLDivElement>(null);
  // Stepping stops at the ends of the current page
  const previousId = pageReservations[index - 1]?.id;
  const nextId = pageReservations[index + 1]?.id;

  useEffect(() => {
    if (!reservation) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // An open menu or confirmation keeps the arrow keys to itself
      if (document.querySelector('[role="menu"], [role="alertdialog"]')) {
        return;
      }
      const targetId =
        event.key === 'ArrowUp'
          ? previousId
          : event.key === 'ArrowDown'
            ? nextId
            : undefined;
      if (targetId !== undefined) {
        event.preventDefault();
        onSelect(targetId);
      }
    };

    // Capture phase: the open dialog stops arrow keys from bubbling this far
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [reservation, previousId, nextId, onSelect]);

  return (
    <Drawer
      open={reservation !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      {/* Focus lands on the panel, not on its first button: opened from a link
          that button would show a focus ring nobody asked for */}
      <DrawerContent ref={popupRef} initialFocus={popupRef}>
        {reservation && (
          <ReservationDetails
            reservation={reservation}
            onPrevious={
              previousId === undefined ? undefined : () => onSelect(previousId)
            }
            onNext={nextId === undefined ? undefined : () => onSelect(nextId)}
          />
        )}
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
    <div className="flex min-w-0 items-start gap-2">
      {/* As tall as one text line, so the flag sits on the first line of a
          name that wraps */}
      <span className="flex h-5 shrink-0 items-center">
        <CountryFlag
          code={guest.nationality_code}
          title={countryName}
          className="size-4"
          aria-label={countryName}
        />
      </span>
      <span className="min-w-0 wrap-break-word">
        {guest.last_name}, {guest.first_name}
      </span>
    </div>
  );
}

function CheckinMethodLabel({ method }: { method: CheckinMethod | null }) {
  if (method === null) {
    return (
      <EmptyValue>
        <Trans>Not yet</Trans>
      </EmptyValue>
    );
  }

  const { Icon, label } = {
    android: { Icon: AndroidIcon, label: <Trans>Android App</Trans> },
    ios: { Icon: AppleIcon, label: <Trans>iOS App</Trans> },
    tv: { Icon: TvIcon, label: <Trans>TV App</Trans> },
    station: { Icon: MonitorIcon, label: <Trans>Station</Trans> },
    web: { Icon: GlobeIcon, label: <Trans>Web App</Trans> }
  }[method];

  return (
    <span className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      {label}
    </span>
  );
}

function ReservationDetails({
  reservation,
  onPrevious,
  onNext
}: {
  reservation: Reservation;
  /** Undefined at the ends of the page. */
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  const { i18n, t } = useLingui();
  const locale = i18n.locale;
  const [primaryGuest, ...fellowTravelers] = reservation.guests;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DrawerHeader className="space-y-2 py-3">
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
        <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
          <StatusCell status={reservation.state} />
          {reservation.room_name && (
            // A long room name gives way to the actions; the full name is in
            // the body
            <span className="min-w-0 truncate" title={reservation.room_name}>
              {reservation.room_name}
            </span>
          )}
          {/* Split button: the main part edits, the arrow holds the rest */}
          <div className="ml-auto flex shrink-0 text-foreground">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-r-none"
              nativeButton={false}
              render={
                <Link
                  to="/reservations/$reservationId"
                  params={{ reservationId: String(reservation.id) }}
                  preload="intent"
                />
              }
            >
              <PencilIcon className="size-3" />
              <Trans>Edit reservation</Trans>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="-ml-px rounded-l-none"
                    aria-label={t`More actions`}
                    title={t`More actions`}
                  />
                }
              >
                <ChevronDownIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto min-w-40">
                <DropdownMenuItem
                  variant="destructive-soft"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2Icon className="mr-1 h-4 w-4" />
                  <Trans>Delete reservation</Trans>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DrawerHeader>

      <DrawerBody className="space-y-5">
        <DetailSection title={<Trans>Reservation</Trans>}>
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
            {/* Formatted and coloured as in the table's balance column */}
            <span
              className={cn(
                'tabular-nums',
                reservation.balance < 0 && 'text-danger'
              )}
            >
              <CurrencyFormatter value={reservation.balance} currency="EUR" />
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

      <DrawerFooter className="flex-row items-center justify-between py-3 sm:justify-between">
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={!onPrevious}
            onClick={onPrevious}
            aria-label={t`Previous reservation`}
            title={t`Previous reservation`}
          >
            <ChevronUpIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={!onNext}
            onClick={onNext}
            aria-label={t`Next reservation`}
            title={t`Next reservation`}
          >
            <ChevronDownIcon />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info(t`Pushed to device`)}
        >
          <MessageSquareDotIcon />
          <Trans>Push to device</Trans>
        </Button>
      </DrawerFooter>
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        reservationNr={reservation.booking_nr}
        reservationId={reservation.id}
      />
    </>
  );
}
