import { Trans } from '@lingui/react/macro';
import type * as React from 'react';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';

import { TOTP_CODE_LENGTH } from '../../shared/types/profile';

interface OtpFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired once all six digits are present, so the user needn't press Verify. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  'aria-describedby'?: string;
  id?: string;
}

/**
 * Six segmented digits, split 3+3 the way authenticator apps display them.
 * `input-otp` handles the fiddly parts for us: paste spreading across cells,
 * backspace stepping back, and a numeric keypad on touch devices.
 */
export function OtpField({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  autoFocus,
  id,
  'aria-describedby': ariaDescribedby
}: OtpFieldProps) {
  return (
    <InputOTP
      id={id}
      maxLength={TOTP_CODE_LENGTH}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      disabled={disabled}
      autoFocus={autoFocus}
      inputMode="numeric"
      // Lets iOS and Android offer the code straight from the SMS/app banner.
      autoComplete="one-time-code"
      // Indexed per slot, not repeated across them — one glyph per box.
      placeholder={'○'.repeat(TOTP_CODE_LENGTH)}
      pattern="[0-9]*"
      aria-invalid={invalid}
      aria-describedby={ariaDescribedby}
      aria-label={undefined}
      containerClassName="justify-start"
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}

export function OtpHint({ id }: { id?: string }) {
  return (
    <p id={id} className="text-sm text-muted-foreground">
      <Trans>
        Codes are time-based — if yours keeps failing, check that your phone's
        clock is set automatically.
      </Trans>
    </p>
  );
}

export type { OtpFieldProps };
export const OTP_LENGTH: number = TOTP_CODE_LENGTH;

/** Shared helper: is this a complete code? */
export function isCompleteOtp(value: string): boolean {
  return new RegExp(`^\\d{${TOTP_CODE_LENGTH}}$`).test(value);
}

export type OtpChangeHandler = React.Dispatch<React.SetStateAction<string>>;
