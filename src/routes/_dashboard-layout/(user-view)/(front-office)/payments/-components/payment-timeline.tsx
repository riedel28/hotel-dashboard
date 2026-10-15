import { Plural, Trans, useLingui } from '@lingui/react/macro';
import {
  isPartialCapture,
  isStaleAuthorization,
  latestStage,
  type Payment,
  type PaymentStage,
  paymentStageSchema
} from 'shared/types/payments';

import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/date';

import { Money, stageLabels, warningText } from './payment-parts';

const DAY_MS = 24 * 60 * 60 * 1000;

// A hanging authorization only needs attention, so it is orange; a short
// capture takes the danger red the other warnings use
const tones = {
  caution: {
    dot: 'bg-orange-500 dark:bg-orange-400',
    ring: 'ring-orange-500/25 dark:ring-orange-400/25',
    text: 'text-orange-700 dark:text-orange-300'
  },
  danger: { dot: 'bg-danger', ring: 'ring-danger/25', text: warningText }
};

// Saturated fills matching the stage badges' colors
const stageDot = {
  authorized: 'bg-sky-600 dark:bg-sky-400',
  captured: 'bg-indigo-600 dark:bg-indigo-400',
  paid: 'bg-emerald-600 dark:bg-emerald-400'
} satisfies Record<PaymentStage, string>;

const stageRing = {
  authorized: 'ring-sky-600/20 dark:ring-sky-400/25',
  captured: 'ring-indigo-600/20 dark:ring-indigo-400/25',
  paid: 'ring-emerald-600/20 dark:ring-emerald-400/25'
} satisfies Record<PaymentStage, string>;

/**
 * The stages top to bottom: reached ones filled with their amount and date,
 * the one the payment is at ringed, the ones ahead hollow and grey. A paid
 * payment is done, so nothing is ringed.
 */
export function PaymentTimeline({ payment }: { payment: Payment }) {
  const { t } = useLingui();
  const latest = paymentStageSchema.options.indexOf(latestStage(payment).stage);
  const isStale = isStaleAuthorization(payment);
  const isPartial = isPartialCapture(payment);
  const staleDays = Math.floor(
    (Date.now() - payment.authorized_at.getTime()) / DAY_MS
  );

  const steps = {
    authorized: {
      amount: payment.authorized_amount,
      at: payment.authorized_at,
      tone: tones.caution,
      warning: isStale && (
        <Plural
          value={staleDays}
          one="Not captured for # day"
          other="Not captured for # days"
        />
      )
    },
    captured: {
      amount: payment.captured_amount,
      at: payment.captured_at,
      tone: tones.danger,
      warning: isPartial && <Trans>Partially captured</Trans>
    },
    // Paid out is the captured amount
    paid: {
      amount: payment.captured_amount,
      at: payment.paid_at,
      tone: tones.danger,
      warning: false
    }
  } satisfies Record<PaymentStage, unknown>;

  return (
    <ol>
      {paymentStageSchema.options.map((stage, index) => {
        const step = steps[stage];
        const isReached = index <= latest;
        const isCurrent = index === latest && stage !== 'paid';
        const isLast = index === paymentStageSchema.options.length - 1;

        return (
          <li
            key={stage}
            aria-current={isCurrent ? 'step' : undefined}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {/* The line down to the next stage: dashed where it leads to a
                stage not reached yet */}
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-[18px] -bottom-0.5 left-1 -translate-x-1/2 border-l',
                  index < latest
                    ? 'border-foreground/25'
                    : 'border-dashed border-muted-foreground/50'
                )}
              />
            )}
            {/* A dot centred on the first text line: filled once reached,
                ringed where the payment is now, an empty outline ahead */}
            <span
              aria-hidden="true"
              className={cn(
                'mt-1.5 size-2 shrink-0 rounded-full',
                isReached
                  ? step.warning
                    ? step.tone.dot
                    : stageDot[stage]
                  : 'border border-muted-foreground/60',
                isCurrent && [
                  'ring-[3px]',
                  step.warning ? step.tone.ring : stageRing[stage]
                ]
              )}
            />

            <div
              className={cn(
                'grid min-w-0 flex-1 grid-cols-[1fr_auto] gap-x-4 text-sm',
                !isReached && 'text-muted-foreground'
              )}
            >
              <span className={cn(isCurrent && 'font-semibold')}>
                {t(stageLabels[stage])}
              </span>
              <span className="text-right">
                {isReached && step.amount !== null ? (
                  <Money amount={step.amount} currency={payment.currency} />
                ) : (
                  <Trans>Expected</Trans>
                )}
              </span>

              <span className="text-xs text-muted-foreground tabular-nums">
                {isReached && step.at
                  ? formatDate(step.at, { preset: 'dateTime' })
                  : null}
              </span>
              {stage === 'captured' && isReached && isPartial && (
                <span className="text-right text-xs text-muted-foreground">
                  <Trans>
                    of{' '}
                    <Money
                      amount={payment.authorized_amount}
                      currency={payment.currency}
                    />
                  </Trans>
                </span>
              )}

              {isReached && step.warning && (
                <span
                  className={cn('col-span-2 mt-0.5 text-xs', step.tone.text)}
                >
                  {step.warning}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
