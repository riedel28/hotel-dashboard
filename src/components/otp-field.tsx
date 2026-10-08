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

// Everything else goes to the underlying <input> as is: name, ref, onBlur,
// required, disabled, autoFocus, aria-* and the like.
interface OtpFieldProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'maxLength' | 'pattern' | 'children'
> {
  value: string;
  onChange: (value: string) => void;
  /** Fired once every digit is present, so the user needn't press Verify. */
  onComplete?: (value: string) => void;
  /** Number of digits; an authenticator code by default. */
  length?: number;
  /**
   * Digits per visual group, with a dash between groups (4 turns twelve
   * digits into 4-4-4). One group by default.
   */
  groupSize?: number;
  /**
   * Cells share the field's width instead of keeping their fixed size — for
   * a code too long to fit at that size.
   */
  stretch?: boolean;
  invalid?: boolean;
}

/**
 * Segmented digits for a code shown elsewhere: an authenticator code, a device
 * PIN. `input-otp` handles the fiddly parts for us: paste spreading across
 * cells, backspace stepping back, and a numeric keypad on touch devices.
 */
export function OtpField({
  length = TOTP_CODE_LENGTH,
  groupSize = length,
  stretch = false,
  invalid,
  // Indexed per slot, not repeated across them — one glyph per box.
  placeholder = '○'.repeat(length),
  // Lets iOS and Android offer the code straight from the SMS/app banner.
  autoComplete = 'one-time-code',
  ...inputProps
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
      {...inputProps}
      maxLength={length}
      inputMode="numeric"
      autoComplete={autoComplete}
      placeholder={placeholder}
      pattern="[0-9]*"
      // A code copied with its dashes or spaces still pastes
      pasteTransformer={(text) => text.replace(/\D/g, '')}
      aria-invalid={invalid}
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
