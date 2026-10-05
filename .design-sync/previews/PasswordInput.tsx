import { Label, PasswordInput } from 'tanstack-dashboard-ui';

const field = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  width: 320
} as const;

const stack = { display: 'flex', flexDirection: 'column', gap: 16 } as const;

const hint = { fontSize: 12, opacity: 0.7 } as const;

const error = { fontSize: 12, color: 'var(--color-destructive)' } as const;

export function Default() {
  return (
    <div style={field}>
      <Label htmlFor="staff-password">Password</Label>
      <PasswordInput
        id="staff-password"
        placeholder="Enter your password"
        autoComplete="current-password"
      />
    </div>
  );
}

export function WithValue() {
  return (
    <div style={field}>
      <Label htmlFor="new-password">New password</Label>
      <PasswordInput
        id="new-password"
        defaultValue="harbour-lantern-42"
        autoComplete="new-password"
      />
      <span style={hint}>
        Used for the front desk terminal and the mobile housekeeping app.
      </span>
    </div>
  );
}

export function Invalid() {
  return (
    <div style={field}>
      <Label htmlFor="confirm-password">Confirm password</Label>
      <PasswordInput
        id="confirm-password"
        defaultValue="harbour-lantrn"
        aria-invalid
        autoComplete="new-password"
      />
      <span style={error}>Passwords do not match.</span>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={field}>
      <Label htmlFor="sso-password">Password</Label>
      <PasswordInput id="sso-password" defaultValue="managed-by-sso" disabled />
      <span style={hint}>Managed by your identity provider.</span>
    </div>
  );
}

export function SignInForm() {
  return (
    <div style={{ ...stack, width: 320 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Label htmlFor="login-password">Password</Label>
        <PasswordInput
          id="login-password"
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Label htmlFor="login-password-repeat">Repeat password</Label>
        <PasswordInput
          id="login-password-repeat"
          placeholder="Repeat your password"
          autoComplete="new-password"
        />
      </div>
    </div>
  );
}
