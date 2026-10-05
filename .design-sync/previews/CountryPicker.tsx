import { CountryPicker } from 'tanstack-dashboard-ui';

const box = { width: 280 } as const;

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

// CountryPicker is controlled-only and requires onValueChange; previews are
// static, so the handler intentionally does nothing.
const noop = () => {
  /* no-op */
};

export function Default() {
  return (
    <div style={box}>
      <CountryPicker
        value={undefined}
        onValueChange={noop}
        placeholder="Guest nationality"
      />
    </div>
  );
}

export function Selected() {
  return (
    <div style={row}>
      <div style={{ ...field, ...box }}>
        <span style={caption}>Guest nationality</span>
        <CountryPicker value="DE" onValueChange={noop} />
      </div>
      <div style={{ ...field, ...box }}>
        <span style={caption}>Billing country</span>
        <CountryPicker value="JP" onValueChange={noop} />
      </div>
    </div>
  );
}

export function RestrictedCodes() {
  return (
    <div style={{ ...field, ...box }}>
      <span style={caption}>Properties operate in DACH + IT only</span>
      <CountryPicker
        value="AT"
        onValueChange={noop}
        codes={['AT', 'CH', 'DE', 'IT']}
      />
    </div>
  );
}

export function States() {
  return (
    <div style={row}>
      <div style={{ ...field, ...box }}>
        <span style={caption}>disabled</span>
        <CountryPicker value="FR" onValueChange={noop} disabled />
      </div>
      <div style={{ ...field, ...box }}>
        <span style={caption}>aria-invalid</span>
        <CountryPicker
          value={undefined}
          onValueChange={noop}
          placeholder="Guest nationality"
          aria-invalid="true"
        />
      </div>
    </div>
  );
}
