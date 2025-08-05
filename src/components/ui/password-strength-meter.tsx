import { useMemo } from 'react';

import { CheckIcon, XIcon } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({
  password
}: PasswordStrengthMeterProps) {
  const intl = useIntl();

  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: 'profile.password.requirement.minLength' },
      { regex: /[0-9]/, text: 'profile.password.requirement.number' },
      { regex: /[a-z]/, text: 'profile.password.requirement.lowercase' },
      { regex: /[A-Z]/, text: 'profile.password.requirement.uppercase' },
      {
        regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        text: 'profile.password.requirement.specialChar'
      }
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text
    }));
  };

  const strength = checkStrength(password);

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
    if (score === 0) return 'profile.password.enterPassword';
    if (score <= 2) return 'profile.password.weakPassword';
    if (score <= 3) return 'profile.password.mediumPassword';
    if (score <= 4) return 'profile.password.goodPassword';
    return 'profile.password.strongPassword';
  };

  return (
    <div>
      {/* Password strength indicator */}
      <div
        className="bg-border mt-3 mb-4 h-1 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={strengthScore}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-label={intl.formatMessage({
          id: 'profile.password.strength',
          defaultMessage: 'Password strength'
        })}
      >
        <div
          className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
          style={{ width: `${(strengthScore / 5) * 100}%` }}
        ></div>
      </div>

      {/* Password strength description */}
      <p className="text-foreground mb-2 text-sm font-medium">
        <FormattedMessage
          id={getStrengthText(strengthScore)}
          defaultMessage="Enter a password"
        />
        <FormattedMessage id="common.period" defaultMessage="." />
        <FormattedMessage id="common.space" defaultMessage=" " />
        <FormattedMessage
          id="profile.password.mustContain"
          defaultMessage="Must contain:"
        />
      </p>

      {/* Password requirements list */}
      <ul
        className="space-y-1.5"
        aria-label={intl.formatMessage({
          id: 'profile.password.strength',
          defaultMessage: 'Password strength'
        })}
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
              <FormattedMessage
                id={req.text}
                defaultMessage="At least 8 characters"
              />
              <span className="sr-only">
                <FormattedMessage
                  id={
                    req.met
                      ? 'profile.password.requirement.met'
                      : 'profile.password.requirement.notMet'
                  }
                  defaultMessage=" - Requirement met"
                />
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
