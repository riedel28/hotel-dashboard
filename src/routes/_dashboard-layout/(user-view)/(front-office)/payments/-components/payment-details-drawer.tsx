import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import {
  isCardExpired,
  latestStage,
  type Payment
} from 'shared/types/payments';

import { paymentQueryOptions } from '@/api/payments';
import { BRAND_NAMES, BrandMark } from '@/components/brand-mark';
import { DetailRow, DetailSection } from '@/components/detail-list';
import { DrawerUnavailable } from '@/components/drawer-unavailable';
import { ReservationLink } from '@/components/reservation-link';
import { CopyButton } from '@/components/ui/copy-button';
import { CurrencyFormatter } from '@/components/ui/currency-formatter';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { useStepThroughList } from '@/hooks/use-step-through-list';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/date';

import { maskCardNumber } from '../-lib/format';
import { dangerText } from '../-lib/tones';
import { PaymentStatusBadge, PaymentTypeLabel } from './payment-fields';
import { PaymentTimeline } from './payment-timeline';

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
  useStepThroughList(pagePayments, paymentId, onSelect);

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
      <DrawerUnavailable
        isLoading={paymentQuery.isPending}
        error={paymentQuery.error}
        loadingText={<Trans>Loading payment…</Trans>}
        notFoundTitle={<Trans>Payment not found</Trans>}
        notFoundText={<Trans>This payment does not exist.</Trans>}
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
          <CurrencyFormatter
            value={latest.amount}
            currency={payment.currency}
            className="text-base font-semibold text-foreground"
          />
          {payment.room_name && <span>{payment.room_name}</span>}
        </div>
      </DrawerHeader>

      <DrawerBody className="space-y-6">
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
              {BRAND_NAMES[payment.card_brand]}
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
            <span className={cn('tabular-nums', expired && dangerText)}>
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

        <section className="space-y-3">
          <h3 className="text-sm font-medium">
            <Trans>History</Trans>
          </h3>
          <PaymentTimeline payment={payment} />
        </section>
      </DrawerBody>
    </>
  );
}
