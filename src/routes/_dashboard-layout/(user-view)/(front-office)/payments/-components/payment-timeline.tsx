import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { CheckIcon } from 'lucide-react';
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
      warning: isPartial && <Trans>Partially captured</Trans>
    },
    // Paid out is the captured amount
    paid: {
      amount: payment.captured_amount,
      at: payment.paid_at,
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
                  'absolute top-6 bottom-1 left-2.5 -translate-x-1/2 border-l',
                  index < latest
                    ? 'border-foreground/25'
                    : 'border-dashed border-muted-foreground/50'
                )}
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                'relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                isReached
                  ? [
                      'text-white dark:text-background',
                      step.warning
                        ? 'bg-orange-500 dark:bg-orange-400'
                        : stageDot[stage]
                    ]
                  : 'border-[1.5px] border-dashed border-muted-foreground/70 bg-background',
                isCurrent && [
                  'ring-4',
                  step.warning
                    ? 'ring-orange-500/20 dark:ring-orange-400/25'
                    : stageRing[stage]
                ]
              )}
            >
              {isReached && !isCurrent && (
                <CheckIcon className="size-3" strokeWidth={3} />
              )}
            </span>

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
                <span className={cn('col-span-2 mt-0.5 text-xs', warningText)}>
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
