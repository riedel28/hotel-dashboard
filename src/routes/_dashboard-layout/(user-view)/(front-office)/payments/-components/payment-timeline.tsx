import { Plural, Trans, useLingui } from '@lingui/react/macro';
import {
  type Payment,
  paymentStages,
  type StageFlag
} from 'shared/types/payments';

import { CurrencyFormatter } from '@/components/ui/currency-formatter';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/date';

import { flagTones, stageTones } from '../-lib/tones';
import { stageLabels } from './payment-fields';

function FlagText({ flag }: { flag: StageFlag }) {
  return flag.kind === 'stale' ? (
    <Plural
      value={flag.days}
      one="Not captured for # day"
      other="Not captured for # days"
    />
  ) : (
    <Trans>Partially captured</Trans>
  );
}

/**
 * The stages top to bottom: reached ones filled with their amount and date,
 * the one the payment is at ringed, the ones ahead an empty outline.
 */
export function PaymentTimeline({ payment }: { payment: Payment }) {
  const { t } = useLingui();
  const steps = paymentStages(payment);

  return (
    <ol>
      {steps.map((step, index) => {
        const next = steps[index + 1];
        const isReached = step.state !== 'pending';
        const tone =
          isReached && step.flag
            ? flagTones[step.flag.kind]
            : stageTones[step.stage];

        return (
          <li
            key={step.stage}
            aria-current={step.state === 'current' ? 'step' : undefined}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {/* The line down to the next stage: dashed where it leads to a
                stage not reached yet */}
            {next && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-[18px] -bottom-0.5 left-1 -translate-x-1/2 border-l',
                  next.state === 'pending'
                    ? 'border-dashed border-muted-foreground/50'
                    : 'border-foreground/25'
                )}
              />
            )}
            {/* A dot centred on the first text line */}
            <span
              aria-hidden="true"
              className={cn(
                'mt-1.5 size-2 shrink-0 rounded-full',
                isReached ? tone.dot : 'border border-muted-foreground/60',
                step.state === 'current' && ['ring-[3px]', tone.ring]
              )}
            />

            <div
              className={cn(
                'grid min-w-0 flex-1 grid-cols-[1fr_auto] gap-x-4 text-sm',
                !isReached && 'text-muted-foreground'
              )}
            >
              <span className={cn(step.state === 'current' && 'font-semibold')}>
                {t(stageLabels[step.stage])}
              </span>
              <span className="text-right">
                {isReached ? (
                  <CurrencyFormatter
                    value={step.amount}
                    currency={payment.currency}
                  />
                ) : (
                  <Trans>Expected</Trans>
                )}
              </span>

              {isReached && (
                <>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatDate(step.at, { preset: 'dateTime' })}
                  </span>
                  {step.flag?.kind === 'partial' && (
                    <span className="text-right text-xs text-muted-foreground">
                      <Trans>
                        of{' '}
                        <CurrencyFormatter
                          value={step.flag.of}
                          currency={payment.currency}
                        />
                      </Trans>
                    </span>
                  )}
                  {step.flag && (
                    <span
                      className={cn(
                        'col-span-2 mt-0.5 text-xs',
                        flagTones[step.flag.kind].text
                      )}
                    >
                      <FlagText flag={step.flag} />
                    </span>
                  )}
                </>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
