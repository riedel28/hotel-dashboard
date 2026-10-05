import { CountryFlag } from 'tanstack-dashboard-ui';

/**
 * Sizing goes through `className`, not `style`: the unknown-code branch of
 * CountryFlag renders its placeholder span with only `className`/`aria-label`
 * and never spreads the rest of its props, so an inline `style` is silently
 * dropped and the chip collapses to zero size.
 */
const SIZE = 'w-7 h-5';

const row = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: 14
} as const;

const GUESTS = [
  { code: 'DE', name: 'Anna Krüger', room: '214' },
  { code: 'GB', name: 'Oliver Bennett', room: '317' },
  { code: 'JP', name: 'Yuki Tanaka', room: '402' },
  { code: 'BR', name: 'Camila Rocha', room: '118' }
];

export function Default() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {['DE', 'GB', 'FR', 'IT', 'ES', 'JP', 'US', 'BR'].map((code) => (
        <CountryFlag
          key={code}
          code={code}
          className={SIZE}
          aria-label={code}
        />
      ))}
    </div>
  );
}

export function InGuestList() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 320
      }}
    >
      {GUESTS.map((g) => (
        <div key={g.room} style={row}>
          <CountryFlag code={g.code} className={SIZE} aria-label={g.code} />
          <span style={{ flex: 1 }}>{g.name}</span>
          <span style={{ color: 'var(--muted-foreground)' }}>
            Room {g.room}
          </span>
        </div>
      ))}
    </div>
  );
}

export function UnknownCode() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontSize: 14
      }}
    >
      <div style={row}>
        <CountryFlag code="DE" className={SIZE} aria-label="DE" />
        <span>Known code — renders the flag.</span>
      </div>
      <div style={row}>
        <CountryFlag code="ZZ" className={SIZE} aria-label="Unknown" />
        <span style={{ color: 'var(--muted-foreground)' }}>
          Unrecognised code — falls back to a muted chip of the same size.
        </span>
      </div>
    </div>
  );
}
