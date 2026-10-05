import { NumberInput } from 'tanstack-dashboard-ui';

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'flex-start',
  flexWrap: 'wrap'
} as const;

const field = { display: 'flex', flexDirection: 'column', gap: 6 } as const;

const caption = {
  fontSize: 12,
  color: 'var(--color-muted-foreground, #6b7280)'
} as const;

const narrow = { width: 150 } as const;
const wide = { width: 190 } as const;

export function Default() {
  return (
    <div style={{ ...field, ...narrow }}>
      <span style={caption}>Adults</span>
      <NumberInput defaultValue={2} min={1} max={6} />
    </div>
  );
}

export function Occupancy() {
  return (
    <div style={row}>
      <div style={{ ...field, ...narrow }}>
        <span style={caption}>Adults</span>
        <NumberInput defaultValue={2} min={1} max={6} />
      </div>
      <div style={{ ...field, ...narrow }}>
        <span style={caption}>Children</span>
        <NumberInput defaultValue={1} min={0} max={4} />
      </div>
      <div style={{ ...field, ...narrow }}>
        <span style={caption}>Nights</span>
        <NumberInput defaultValue={3} min={1} max={28} />
      </div>
    </div>
  );
}

export function Formatted() {
  return (
    <div style={row}>
      <div style={{ ...field, ...wide }}>
        <span style={caption}>Nightly rate (EUR)</span>
        <NumberInput
          defaultValue={189}
          min={0}
          step={5}
          format={{ style: 'currency', currency: 'EUR' }}
          locale="de-DE"
        />
      </div>
      <div style={{ ...field, ...wide }}>
        <span style={caption}>City tax</span>
        <NumberInput
          defaultValue={0.05}
          min={0}
          max={1}
          step={0.01}
          format={{ style: 'percent', maximumFractionDigits: 2 }}
        />
      </div>
    </div>
  );
}

export function States() {
  return (
    <div style={row}>
      <div style={{ ...field, ...narrow }}>
        <span style={caption}>disabled</span>
        <NumberInput defaultValue={2} min={1} max={6} disabled />
      </div>
      <div style={{ ...field, ...narrow }}>
        <span style={caption}>readOnly</span>
        <NumberInput defaultValue={4} readOnly />
      </div>
      <div style={{ ...field, ...narrow }}>
        <span style={caption}>empty</span>
        <NumberInput min={1} max={6} />
      </div>
    </div>
  );
}
