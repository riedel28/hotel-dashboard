import { Trans } from '@lingui/react/macro';
import { Fragment } from 'react';
import type * as React from 'react';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';

import { TOTP_CODE_LENGTH } from '../../shared/types/profile';

interface OtpFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired once every digit is present, so the user needn't press Verify. */
  onComplete?: (value: string) => void;
  onBlur?: () => void;
  ref?: React.Ref<HTMLInputElement>;
  name?: string;
  /** Number of digits; an authenticator code by default. */
  length?: number;
  /**
   * Digits per visual group, with a dash between groups (4 turns twelve
   * digits into 4-4-4). One group by default.
   */
  groupSize?: number;
  /** Cells share the field's width instead of keeping their fixed size. */
  stretch?: boolean;
  /** One glyph per empty cell; pass an empty string for none. */
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  'aria-describedby'?: string;
  id?: string;
}

/**
 * Segmented digits for a code shown elsewhere: an authenticator code, a device
 * PIN. `input-otp` handles the fiddly parts for us: paste spreading across
 * cells, backspace stepping back, and a numeric keypad on touch devices.
 */
export function OtpField({
  value,
  onChange,
  onComplete,
  onBlur,
  ref,
  name,
  length = TOTP_CODE_LENGTH,
  groupSize = length,
  stretch = false,
  // Indexed per slot, not repeated across them — one glyph per box.
  placeholder = '○'.repeat(length),
  // Lets iOS and Android offer the code straight from the SMS/app banner.
  autoComplete = 'one-time-code',
  required,
  disabled,
  invalid,
  autoFocus,
  id,
  'aria-describedby': ariaDescribedby
}: OtpFieldProps) {
  const groups = Array.from(
    { length: Math.ceil(length / groupSize) },
    (_, group) =>
      Array.from(
        { length: Math.min(groupSize, length - group * groupSize) },
        (_, slot) => group * groupSize + slot
      )
  );

  return (
    <InputOTP
      id={id}
      ref={ref}
      name={name}
      maxLength={length}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      onBlur={onBlur}
      required={required}
      disabled={disabled}
      autoFocus={autoFocus}
      inputMode="numeric"
      autoComplete={autoComplete}
      placeholder={placeholder}
      pattern="[0-9]*"
      // A code copied with its dashes or spaces still pastes
      pasteTransformer={(text) => text.replace(/\D/g, '')}
      aria-invalid={invalid}
      aria-describedby={ariaDescribedby}
      aria-label={undefined}
      containerClassName={stretch ? 'w-full gap-1.5' : 'justify-start gap-2'}
    >
      {groups.map((slots, group) => (
        <Fragment key={group}>
          {group > 0 && (
            <div
              role="separator"
              className="h-px w-2 shrink-0 bg-muted-foreground/70"
            />
          )}
          <InputOTPGroup className={cn(stretch && 'min-w-0 flex-1 gap-1')}>
            {slots.map((slot) => (
              <InputOTPSlot
                key={slot}
                index={slot}
                className={cn(
                  stretch && 'h-11 w-auto min-w-0 flex-1 font-mono text-base'
                )}
              />
            ))}
          </InputOTPGroup>
        </Fragment>
      ))}
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
