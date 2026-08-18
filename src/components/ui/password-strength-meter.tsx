import { i18n } from '@lingui/core';
import { Trans, useLingui } from '@lingui/react/macro';
import { CheckIcon, MinusIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import {
  MIN_PASSWORD_LENGTH,
  strongPasswordSchema
} from '../../../shared/types/users';

/**
 * Strength is entropy-based rather than "how many rules did you satisfy".
 * `Hotel2026!` ticks every checklist box and is still one of the first things
 * an attacker tries, so a rules-only meter would call it strong and lie.
 *
 * The checklist stays too — it states the policy the server actually enforces —
 * but it answers "will this be accepted", not "is this any good".
 */

type Score = 0 | 1 | 2 | 3 | 4;

interface Estimator {
  check: (
    password: string,
    userInputs?: (string | number)[]
  ) => { score: Score; feedback: { warning: string | null } };
}

let estimatorPromise: Promise<Estimator> | null = null;

/**
 * Loaded on first keystroke, never in the initial bundle — most sessions never
 * open a password field at all.
 *
 * Only `language-common` is pulled in: its leaked-password ranking is what
 * actually catches a guessable password, and it costs ~420 KB. The per-language
 * packs are another ~2 MB of surnames and Wikipedia titles, which mostly guard
 * against "my password is a famous word" — a poor trade here, and the part that
 * matters for *this* user is covered by feeding their own details in as
 * `userInputs` below.
 */
function loadEstimator(): Promise<Estimator> {
  if (estimatorPromise) return estimatorPromise;

  estimatorPromise = (async () => {
    const [core, common, translations] = await Promise.all([
      import('@zxcvbn-ts/core'),
      import('@zxcvbn-ts/language-common'),
      i18n.locale === 'de'
        ? import('@zxcvbn-ts/language-de/dist/translations')
        : import('@zxcvbn-ts/language-en/dist/translations')
    ]);

    return new core.ZxcvbnFactory({
      graphs: common.adjacencyGraphs,
      translations: translations.default ?? translations,
      dictionary: common.dictionary
    }) as Estimator;
  })();

  return estimatorPromise;
}

interface Requirement {
  label: React.ReactNode;
  met: boolean;
}

function useRequirements(password: string): Requirement[] {
  return React.useMemo(
    () => [
      {
        label: <Trans>At least {MIN_PASSWORD_LENGTH} characters</Trans>,
        met: password.length >= MIN_PASSWORD_LENGTH
      },
      {
        label: <Trans>Upper and lowercase letters</Trans>,
        met: /[a-z]/.test(password) && /[A-Z]/.test(password)
      },
      {
        label: <Trans>At least one number</Trans>,
        met: /\d/.test(password)
      },
      {
        label: <Trans>At least one symbol</Trans>,
        met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
      }
    ],
    [password]
  );
}

interface PasswordStrengthMeterProps {
  password: string;
  /**
   * Name, email and the like. Feeding these in catches the very common
   * "password built out of my own details", which no dictionary would flag.
   */
  userInputs?: string[];
  className?: string;
}

export function PasswordStrengthMeter({
  password,
  userInputs,
  className
}: PasswordStrengthMeterProps) {
  const { t } = useLingui();
  const requirements = useRequirements(password);
  const [score, setScore] = React.useState<Score | null>(null);
  const [warning, setWarning] = React.useState<string | null>(null);

  // Serialised so the effect doesn't re-run on every re-render of the parent.
  const inputsKey = (userInputs ?? []).join('\u0000');

  React.useEffect(() => {
    if (!password) {
      setScore(null);
      setWarning(null);
      return;
    }

    let cancelled = false;

    void loadEstimator().then((estimator) => {
      if (cancelled) return;
      const result = estimator.check(
        password,
        inputsKey ? inputsKey.split('\u0000') : []
      );
      setScore(result.score);
      setWarning(result.feedback.warning);
    });

    return () => {
      cancelled = true;
    };
  }, [password, inputsKey]);

  const meetsPolicy = strongPasswordSchema.safeParse(password).success;

  const labels: Record<Score, string> = {
    0: t`Very weak`,
    1: t`Weak`,
    2: t`Fair`,
    3: t`Good`,
    4: t`Strong`
  };

  const segmentColors: Record<Score, string> = {
    0: 'bg-rose-500/90',
    1: 'bg-rose-500/90',
    2: 'bg-amber-500',
    3: 'bg-emerald-500',
    4: 'bg-emerald-500'
  };

  // Same reading as the bars. Darker than the fills in light mode: a 500 that
  // reads fine as a 4px bar drops under 4.5:1 as 12px text.
  const labelColors: Record<Score, string> = {
    0: 'text-rose-600 dark:text-rose-400',
    1: 'text-rose-600 dark:text-rose-400',
    2: 'text-amber-600 dark:text-amber-400',
    3: 'text-emerald-700 dark:text-emerald-400',
    4: 'text-emerald-700 dark:text-emerald-400'
  };

  const filled = score === null ? 0 : score + 1;

  return (
    // `flex`, not `space-y-*`: the sr-only live regions below are absolutely
    // positioned, and `space-y` would still hand their in-flow siblings a
    // margin as they mount and unmount. Flex gap skips out-of-flow children.
    <div className={cn('flex flex-col gap-1.5', className)}>
      {/* Height reserved: the label is blank until the estimator resolves, and
          a collapsing row shoves the whole checklist on the first keystroke. */}
      <div className="flex min-h-4 items-center gap-3">
        <div
          className="flex flex-1 gap-1"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={filled}
          aria-label={t`Password strength`}
        >
          {[0, 1, 2, 3, 4].map((segment) => (
            <span
              key={segment}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                segment < filled && score !== null
                  ? segmentColors[score]
                  : 'bg-border'
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            'w-20 shrink-0 text-right text-xs font-medium transition-colors duration-300',
            score === null ? 'text-muted-foreground' : labelColors[score]
          )}
        >
          {score !== null && labels[score]}
        </span>
      </div>

      {/*
        Announced rather than shouted: the level changes on nearly every
        keystroke, so a rude live region would talk over the typing itself.
      */}
      <p aria-live="polite" className="sr-only">
        {score !== null && labels[score]}
      </p>

      {/* Always rendered, for the reason above: warnings come and go as the
          password changes, and an appearing line would move the checklist. */}
      <p className="text-xs text-amber-600 dark:text-amber-500">
        {warning && score !== null && score < 3 ? warning : null}
      </p>

      <ul className="space-y-1" aria-label={t`Password requirements`}>
        {requirements.map((requirement, index) => (
          <li key={index} className="flex items-center gap-2 text-xs">
            {requirement.met ? (
              <CheckIcon
                className="size-3.5 shrink-0 animate-in text-emerald-600 duration-150 zoom-in-50 dark:text-emerald-500"
                aria-hidden="true"
              />
            ) : (
              // A neutral dash, not a red cross: an unwritten password hasn't
              // failed anything yet.
              <MinusIcon
                className="size-3.5 shrink-0 text-muted-foreground/50"
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                requirement.met
                  ? 'text-emerald-700 dark:text-emerald-500'
                  : 'text-muted-foreground'
              )}
            >
              {requirement.label}
            </span>
            <span className="sr-only">
              {requirement.met ? (
                <Trans>— met</Trans>
              ) : (
                <Trans>— not met yet</Trans>
              )}
            </span>
          </li>
        ))}
      </ul>

      {!meetsPolicy && password.length > 0 && (
        <p className="sr-only" aria-live="polite">
          <Trans>Password does not yet meet all requirements</Trans>
        </p>
      )}
    </div>
  );
}
