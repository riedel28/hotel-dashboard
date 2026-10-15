import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { CircleAlertIcon } from 'lucide-react';
import {
  isCardExpired,
  isPartialCapture,
  isStaleAuthorization,
  latestStage,
  type Payment,
  type PaymentStage,
  type PaymentType
} from 'shared/types/payments';

import { BrandMark } from '@/components/brand-mark';
import { Badge, type BadgeColorProps } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import { CurrencyFormatter } from '@/components/ui/currency-formatter';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { maskCardNumber, truncateMiddle } from '../-lib/format';

export const stageLabels = {
  authorized: msg`Authorized`,
  captured: msg`Captured`,
  paid: msg`Paid`
} satisfies Record<PaymentStage, MessageDescriptor>;

export const stageColors = {
  authorized: 'sky',
  captured: 'indigo',
  paid: 'emerald'
} satisfies Record<PaymentStage, BadgeColorProps>;

const typeLabels = {
  prepayment: msg`Prepayment`,
  deposit: msg`Deposit`,
  final: msg`Final payment`,
  no_show: msg`No-show fee`
} satisfies Record<PaymentType, MessageDescriptor>;

// The red the other tables use for a negative balance
export const warningText = 'text-danger';

export function PaymentTypeLabel({ type }: { type: PaymentType }) {
  const { t } = useLingui();
  return <>{t(typeLabels[type])}</>;
}

/**
 * The latest stage as a badge: red while an authorization hangs, with a
 * "partial" note while less was captured than authorized.
 */
export function PaymentStatusBadge({ payment }: { payment: Payment }) {
  const { t } = useLingui();
  const { stage } = latestStage(payment);
  const isStale = isStaleAuthorization(payment);

  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge
        size="sm"
        variant="outline"
        color={isStale ? 'rose' : stageColors[stage]}
        className="rounded-md"
        title={
          isStale ? t`Authorized long ago and not captured yet` : undefined
        }
      >
        {isStale ? (
          <CircleAlertIcon className="size-3" aria-hidden="true" />
        ) : (
          <span className="mr-0.5 size-1.25 rounded-full bg-current/80" />
        )}
        {t(stageLabels[stage])}
      </Badge>
      {stage === 'captured' && isPartialCapture(payment) && (
        <span className={cn('text-xs', warningText)}>
          <Trans>partial</Trans>
        </span>
      )}
    </span>
  );
}

export function Money({
  amount,
  currency
}: {
  amount: number;
  currency: string;
}) {
  return (
    <span className="tabular-nums">
      <CurrencyFormatter value={amount} currency={currency} />
    </span>
  );
}

/** Brand and last four digits, red once the card has expired. */
export function CardSummary({ payment }: { payment: Payment }) {
  const { t } = useLingui();
  const expired = isCardExpired(payment);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap tabular-nums',
        expired && warningText
      )}
      title={expired ? t`Card expired` : undefined}
    >
      <BrandMark brand={payment.card_brand} />
      {maskCardNumber(payment.card_last4)}
      {expired && <CircleAlertIcon className="size-3.5" aria-hidden="true" />}
    </span>
  );
}

/**
 * A reference cut in the middle, whole in a tooltip, with a copy button.
 * Clicks stay here so they do not open the row's payment.
 */
export function ReferenceValue({ reference }: { reference: string }) {
  const { t } = useLingui();

  return (
    <span
      className="inline-flex items-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <Tooltip>
        <TooltipTrigger
          type="button"
          className="rounded-sm font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={reference}
        >
          {truncateMiddle(reference)}
        </TooltipTrigger>
        <TooltipContent className="font-mono">{reference}</TooltipContent>
      </Tooltip>
      <CopyButton
        text={reference}
        size="icon-xs"
        copyLabel={t`Copy reference`}
        copiedLabel={t`Reference copied`}
      />
    </span>
  );
}
