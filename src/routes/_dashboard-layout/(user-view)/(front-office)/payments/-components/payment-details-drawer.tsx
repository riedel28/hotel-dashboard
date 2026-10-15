import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { type ReactNode, useEffect } from 'react';
import {
  isCardExpired,
  latestStage,
  type Payment
} from 'shared/types/payments';

import { ApiError } from '@/api/client';
import { paymentQueryOptions } from '@/api/payments';
import { BrandMark } from '@/components/brand-mark';
import { ReservationLink } from '@/components/reservation-link';
import { CopyButton } from '@/components/ui/copy-button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/date';

import { maskCardNumber } from '../-lib/format';
import {
  Money,
  PaymentStatusBadge,
  PaymentTypeLabel,
  warningText
} from './payment-parts';
import { PaymentTimeline } from './payment-timeline';

const cardBrandNames = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express'
} satisfies Record<Payment['card_brand'], string>;

interface PaymentDetailsDrawerProps {
  /** The open payment; the drawer is closed while undefined. */
  paymentId?: number;
  /** Payments of the current table page: instant content and ↑/↓ navigation. */
  pagePayments: Payment[];
  onSelect: (paymentId: number) => void;
  onClose: () => void;
}

/** Read-only details of one payment: nothing here changes it. */
export function PaymentDetailsDrawer({
  paymentId,
  pagePayments,
  onSelect,
  onClose
}: PaymentDetailsDrawerProps) {
  // ↑/↓ step through the current page and stop at its ends
  useEffect(() => {
    if (paymentId === undefined) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
        return;
      }
      const index = pagePayments.findIndex(({ id }) => id === paymentId);
      const next = pagePayments[index + (event.key === 'ArrowDown' ? 1 : -1)];
      if (index !== -1 && next) {
        event.preventDefault();
        onSelect(next.id);
      }
    };

    // Capture phase: the open dialog stops arrow keys from bubbling this far
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [paymentId, pagePayments, onSelect]);

  return (
    <Drawer
      open={paymentId !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      <DrawerContent>
        {paymentId !== undefined && (
          <PaymentDetails
            // Remount per payment so one's data never shows under another id
            key={paymentId}
            paymentId={paymentId}
            pagePayments={pagePayments}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function PaymentDetails({
  paymentId,
  pagePayments
}: {
  paymentId: number;
  pagePayments: Payment[];
}) {
  const { t } = useLingui();
  const paymentQuery = useQuery({
    ...paymentQueryOptions(paymentId),
    initialData: pagePayments.find(({ id }) => id === paymentId)
  });
  const payment = paymentQuery.data;

  if (!payment) {
    return (
      <PaymentUnavailable
        isLoading={paymentQuery.isPending}
        error={paymentQuery.error}
      />
    );
  }

  const latest = latestStage(payment);
  const expired = isCardExpired(payment);

  return (
    <>
      <DrawerHeader className="space-y-2">
        {/* Only the title row shares its line with the close button */}
        <DrawerTitle className="pr-10">
          <Trans>Payment for {payment.booking_nr}</Trans>
        </DrawerTitle>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-normal text-muted-foreground">
          <PaymentStatusBadge payment={payment} />
          <span className="text-base font-semibold text-foreground">
            <Money amount={latest.amount} currency={payment.currency} />
          </span>
          {payment.room_name && <span>{payment.room_name}</span>}
        </div>
      </DrawerHeader>

      <DrawerBody className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-medium">
            <Trans>History</Trans>
          </h3>
          <PaymentTimeline payment={payment} />
        </section>

        <DetailSection title={<Trans>Details</Trans>}>
          <DetailRow label={<Trans>Reservation</Trans>}>
            <ReservationLink
              reservationId={payment.reservation_id}
              bookingNr={payment.booking_nr}
            />
          </DetailRow>
          <DetailRow label={<Trans>Room</Trans>}>
            {payment.room_name ?? (
              <span className="text-muted-foreground">—</span>
            )}
          </DetailRow>
          <DetailRow label={<Trans>Type</Trans>}>
            <PaymentTypeLabel type={payment.type} />
          </DetailRow>
          <DetailRow label={<Trans>Updated</Trans>}>
            <span className="tabular-nums">
              {formatDate(latest.at, { preset: 'dateTime' })}
            </span>
          </DetailRow>
        </DetailSection>

        <DetailSection title={<Trans>Card</Trans>}>
          <DetailRow label={<Trans>Brand</Trans>}>
            <span className="inline-flex items-center gap-2">
              <BrandMark brand={payment.card_brand} />
              {cardBrandNames[payment.card_brand]}
            </span>
          </DetailRow>
          <DetailRow label={<Trans>Number</Trans>}>
            <span className="tabular-nums">
              {maskCardNumber(payment.card_last4)}
            </span>
          </DetailRow>
          <DetailRow label={<Trans>Holder</Trans>}>
            {payment.card_holder}
          </DetailRow>
          <DetailRow label={<Trans>Expires</Trans>}>
            <span className={cn('tabular-nums', expired && warningText)}>
              {String(payment.card_exp_month).padStart(2, '0')}/
              {payment.card_exp_year}
              {expired && (
                <>
                  {' · '}
                  <Trans>Expired</Trans>
                </>
              )}
            </span>
          </DetailRow>
        </DetailSection>

        <section className="space-y-2">
          <h3 className="text-sm font-medium">
            <Trans>Reference</Trans>
          </h3>
          <div className="relative">
            <pre className="rounded-md border bg-muted/50 p-3 pr-10 font-mono text-xs break-all whitespace-pre-wrap">
              {payment.reference}
            </pre>
            <CopyButton
              text={payment.reference}
              copyLabel={t`Copy reference`}
              copiedLabel={t`Reference copied`}
              buttonClassName="absolute top-1/2 right-2 -translate-y-1/2"
            />
          </div>
        </section>
      </DrawerBody>
    </>
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
      <dl className="grid grid-cols-[7rem_1fr] gap-x-6 gap-y-2 text-sm">
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

/** The drawer's content while the payment is loading or failed to load. */
function PaymentUnavailable({
  isLoading,
  error
}: {
  isLoading: boolean;
  error: Error | null;
}) {
  let title: ReactNode = <Trans>Something went wrong</Trans>;
  let description: ReactNode = error?.message;

  if (isLoading) {
    title = <Skeleton className="h-6 w-40" />;
    description = <Trans>Loading payment…</Trans>;
  } else if (error instanceof ApiError && error.status === 404) {
    title = <Trans>Payment not found</Trans>;
    description = <Trans>This payment does not exist.</Trans>;
  }

  return (
    <DrawerHeader className="space-y-1 pr-14">
      <DrawerTitle>{title}</DrawerTitle>
      <p className="text-sm font-normal text-muted-foreground">{description}</p>
    </DrawerHeader>
  );
}
