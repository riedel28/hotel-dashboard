import { Checkbox, Input, Label, Switch } from 'tanstack-dashboard-ui';

const stack = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  maxWidth: 360
} as const;
const pair = { display: 'flex', flexDirection: 'column', gap: 6 } as const;
const required = { color: 'var(--color-danger)' } as const;

export function Default() {
  return (
    <div style={pair}>
      <Label htmlFor="guest-surname">Guest surname</Label>
      <Input
        id="guest-surname"
        defaultValue="Hartwig"
        style={{ maxWidth: 360 }}
      />
    </div>
  );
}

export function Required() {
  return (
    <div style={stack}>
      <div style={pair}>
        <Label htmlFor="arrival-date">
          Arrival date <span style={required}>*</span>
        </Label>
        <Input id="arrival-date" type="date" defaultValue="2026-08-14" />
      </div>
      <div style={pair}>
        <Label htmlFor="folio-reference">Folio reference</Label>
        <Input id="folio-reference" placeholder="Optional" />
      </div>
    </div>
  );
}

export function WithControl() {
  return (
    <div style={stack}>
      <Label htmlFor="late-checkout">
        <Checkbox id="late-checkout" defaultChecked />
        Late checkout until 14:00
      </Label>
      <Label htmlFor="housekeeping-optout">
        <Switch id="housekeeping-optout" />
        Skip daily housekeeping
      </Label>
    </div>
  );
}

export function WithIcon() {
  return (
    <div style={pair}>
      <Label htmlFor="key-card-pin">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
          style={{ width: 14, height: 14 }}
        >
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
        </svg>
        Key card PIN
      </Label>
      <Input
        id="key-card-pin"
        type="password"
        defaultValue="4821"
        style={{ maxWidth: 360 }}
      />
    </div>
  );
}
