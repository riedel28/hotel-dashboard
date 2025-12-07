import { Trans, useLingui } from '@lingui/react/macro';
import { CheckIcon, XIcon } from 'lucide-react';
import { useMemo } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({
  password
}: PasswordStrengthMeterProps) {
  const { t } = useLingui();

  const requirements = useMemo(
    () => [
      {
        regex: /.{8,}/,
        text: t`At least 8 characters`
      },
      {
        regex: /[0-9]/,
        text: t`Contains a number`
      },
      {
        regex: /[a-z]/,
        text: t`Contains a lowercase letter`
      },
      {
        regex: /[A-Z]/,
        text: t`Contains an uppercase letter`
      },
      {
        regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        text: t`Contains a special character`
      }
    ],
    [t]
  );

  const strength = useMemo(
    () =>
      requirements.map((req) => ({
        met: req.regex.test(password),
        text: req.text
      })),
    [password, requirements]
  );

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getStrengthColor = (score: number) => {
    if (score === 0) return 'bg-border';
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score === 3) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return <Trans>Enter a password</Trans>;
    if (score <= 2) return <Trans>Weak password</Trans>;
    if (score <= 3) return <Trans>Medium password</Trans>;
    if (score <= 4) return <Trans>Good password</Trans>;
    return <Trans>Strong password</Trans>;
  };

  return (
    <div>
      {/* Password strength indicator */}
      <div
        className="mt-3 mb-4 h-1 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={strengthScore}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-label={t`Password strength`}
      >
        <div
          className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
          style={{ width: `${(strengthScore / 5) * 100}%` }}
        ></div>
      </div>

      {/* Password strength description */}
      <p className="mb-2 text-sm font-medium text-foreground">
        {getStrengthText(strengthScore)}{' '}
        <Trans>Enter a password. Must contain:</Trans>
      </p>

      {/* Password requirements list */}
      <ul
        className="space-y-1.5"
        aria-label={t`Password strength requirements`}
      >
        {strength.map((req, index) => (
          <li key={index} className="flex items-center gap-2">
            {req.met ? (
              <CheckIcon
                size={16}
                className="text-emerald-500"
                aria-hidden="true"
              />
            ) : (
              <XIcon
                size={16}
                className="text-muted-foreground/80"
                aria-hidden="true"
              />
            )}
            <span
              className={`text-xs ${
                req.met ? 'text-emerald-600' : 'text-muted-foreground'
              }`}
            >
              {req.text}{' '}
              <span className="sr-only">
                {req.met ? (
                  <Trans> - Requirement met</Trans>
                ) : (
                  <Trans> - Requirement not met</Trans>
                )}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
