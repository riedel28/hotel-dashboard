import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { CircleAlertIcon } from 'lucide-react';
import {
  isCardExpired,
  latestStage,
  type Payment,
  type PaymentStage,
  type PaymentType
} from 'shared/types/payments';

import { BrandMark } from '@/components/brand-mark';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

import { maskCardNumber } from '../-lib/format';
import { dangerText, flagTones, stageTones } from '../-lib/tones';

export const stageLabels = {
  authorized: msg`Authorized`,
  captured: msg`Captured`,
  paid: msg`Paid`
} satisfies Record<PaymentStage, MessageDescriptor>;

const typeLabels = {
  prepayment: msg`Prepayment`,
  deposit: msg`Deposit`,
  final: msg`Final payment`,
  no_show: msg`No-show fee`
} satisfies Record<PaymentType, MessageDescriptor>;

export function PaymentTypeLabel({ type }: { type: PaymentType }) {
  const { t } = useLingui();
  return <>{t(typeLabels[type])}</>;
}

/**
 * The latest stage as a badge, orange while an authorization hangs. A partial
 * capture shows in the drawer's history only.
 */
export function PaymentStatusBadge({ payment }: { payment: Payment }) {
  const { t } = useLingui();
  const { stage, flag } = latestStage(payment);
  const isStale = flag?.kind === 'stale';

  return (
    <Badge
      size="sm"
      variant="outline"
      color={isStale ? flagTones.stale.badge : stageTones[stage].badge}
      className="rounded-md"
      title={isStale ? t`Authorized long ago and not captured yet` : undefined}
    >
      <span className="mr-0.5 size-1.25 rounded-full bg-current/80" />
      {t(stageLabels[stage])}
    </Badge>
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
        expired && dangerText
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
 * A reference with a copy button. Clicks stay here so they do not open the
 * row's payment.
 */
export function ReferenceValue({ reference }: { reference: string }) {
  const { t } = useLingui();

  return (
    <span
      className="inline-flex items-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <span className="font-mono text-xs whitespace-nowrap">{reference}</span>
      <CopyButton
        text={reference}
        size="icon-xs"
        copyLabel={t`Copy reference`}
        copiedLabel={t`Reference copied`}
      />
    </span>
  );
}
