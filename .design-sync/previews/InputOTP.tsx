import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from 'tanstack-dashboard-ui';

const stack = { display: 'flex', flexDirection: 'column', gap: 8 } as const;

const row = {
  display: 'flex',
  gap: 32,
  alignItems: 'flex-start',
  flexWrap: 'wrap'
} as const;

const caption = {
  fontSize: 12,
  color: 'var(--color-muted-foreground, #6b7280)'
} as const;

const errorText = {
  fontSize: 12,
  color: 'var(--color-destructive, #b91c1c)'
} as const;

const splitSix = (
  <>
    <InputOTPGroup>
      <InputOTPSlot index={0} />
      <InputOTPSlot index={1} />
      <InputOTPSlot index={2} />
    </InputOTPGroup>
    <InputOTPSeparator />
    <InputOTPGroup>
      <InputOTPSlot index={3} />
      <InputOTPSlot index={4} />
      <InputOTPSlot index={5} />
    </InputOTPGroup>
  </>
);

export function Default() {
  return (
    <div style={stack}>
      <span style={caption}>
        Enter the six-digit code from your authenticator app
      </span>
      <InputOTP
        maxLength={6}
        value=""
        readOnly
        placeholder="○○○○○○"
        inputMode="numeric"
        autoComplete="one-time-code"
      >
        {splitSix}
      </InputOTP>
    </div>
  );
}

export function Filled() {
  return (
    <div style={stack}>
      <span style={caption}>Code entered, ready to verify</span>
      <InputOTP
        maxLength={6}
        value="418396"
        readOnly
        inputMode="numeric"
        autoComplete="one-time-code"
      >
        {splitSix}
      </InputOTP>
    </div>
  );
}

export function Invalid() {
  return (
    <div style={stack}>
      <InputOTP
        maxLength={6}
        value="418300"
        readOnly
        aria-invalid
        inputMode="numeric"
      >
        {splitSix}
      </InputOTP>
      <span style={errorText}>
        That code has expired. Request a new one and try again.
      </span>
    </div>
  );
}

export function Ungrouped() {
  return (
    <div style={row}>
      <div style={stack}>
        <span style={caption}>Four-digit door PIN</span>
        <InputOTP maxLength={4} value="2140" readOnly inputMode="numeric">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <div style={stack}>
        <span style={caption}>disabled</span>
        <InputOTP
          maxLength={6}
          value="418396"
          readOnly
          disabled
          inputMode="numeric"
        >
          {splitSix}
        </InputOTP>
      </div>
    </div>
  );
}
