import { Input } from 'tanstack-dashboard-ui';

const stack = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  maxWidth: 360
} as const;
const caption = {
  fontSize: 12,
  color: 'var(--color-muted-foreground)'
} as const;

export function Default() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Input placeholder="Search guests, rooms or reservation IDs" />
    </div>
  );
}

export function Types() {
  return (
    <div style={stack}>
      <Input type="text" defaultValue="Amelia Hartwig" />
      <Input type="email" defaultValue="a.hartwig@nordsee-resort.de" />
      <Input type="tel" placeholder="+49 40 555 0142" />
      <Input type="date" defaultValue="2026-08-14" />
      <Input type="number" defaultValue={2} min={1} max={6} />
    </div>
  );
}

export function States() {
  return (
    <div style={stack}>
      <div>
        <Input placeholder="Reservation ID, e.g. RSV-40182" />
        <p style={caption}>Empty with placeholder</p>
      </div>
      <div>
        <Input defaultValue="RSV-40182" />
        <p style={caption}>Filled</p>
      </div>
      <div>
        <Input defaultValue="Deluxe Sea View — 214" readOnly />
        <p style={caption}>Read-only</p>
      </div>
      <div>
        <Input defaultValue="RSV-40182" disabled />
        <p style={caption}>Disabled</p>
      </div>
    </div>
  );
}

export function Invalid() {
  return (
    <div style={stack}>
      <Input aria-invalid defaultValue="14/08/26" />
      <Input aria-invalid placeholder="Room number" />
    </div>
  );
}
