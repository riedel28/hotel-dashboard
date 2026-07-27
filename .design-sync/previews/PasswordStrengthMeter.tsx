import {
  Label,
  PasswordInput,
  PasswordStrengthMeter
} from 'tanstack-dashboard-ui';

const panel = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  width: 340
} as const;

const caption = { fontSize: 12, opacity: 0.7 } as const;

export function Default() {
  return (
    <div style={panel}>
      <Label htmlFor="meter-password">New password</Label>
      <PasswordInput
        id="meter-password"
        defaultValue="Lakeview2026"
        autoComplete="new-password"
      />
      <PasswordStrengthMeter password="Lakeview2026" />
    </div>
  );
}

export function VeryWeak() {
  return (
    <div style={panel}>
      <span style={caption}>“welcome”</span>
      <PasswordStrengthMeter password="welcome" />
    </div>
  );
}

export function Weak() {
  return (
    <div style={panel}>
      <span style={caption}>“summer2026”</span>
      <PasswordStrengthMeter password="summer2026" />
    </div>
  );
}

export function PassesPolicyButGuessable() {
  return (
    <div style={panel}>
      <span style={caption}>
        “Hotel2026!” — every rule ticked, still guessable
      </span>
      <PasswordStrengthMeter password="Hotel2026!" />
    </div>
  );
}

export function Strong() {
  return (
    <div style={panel}>
      <span style={caption}>“harbour-Lantern-42!Quay”</span>
      <PasswordStrengthMeter password="harbour-Lantern-42!Quay" />
    </div>
  );
}

export function WithUserInputs() {
  return (
    <div style={panel}>
      <span style={caption}>Built out of the staff member’s own details</span>
      <PasswordStrengthMeter
        password="Kowalczyk2026!"
        userInputs={['Marta', 'Kowalczyk', 'm.kowalczyk@example.com']}
      />
    </div>
  );
}
