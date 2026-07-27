import { Slider } from 'tanstack-dashboard-ui';

const stack = { display: 'flex', flexDirection: 'column', gap: 24 } as const;

const field = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  width: 360
} as const;

const caption = {
  fontSize: 12,
  color: 'var(--color-muted-foreground, #6b7280)'
} as const;

export function Default() {
  return (
    <div style={field}>
      <span style={caption}>Target occupancy — 72%</span>
      <Slider defaultValue={72} />
    </div>
  );
}

export function Range() {
  return (
    <div style={field}>
      <span style={caption}>Nightly rate filter — €80 to €240</span>
      <Slider defaultValue={[80, 240]} min={40} max={400} step={10} />
    </div>
  );
}

export function Stepped() {
  return (
    <div style={stack}>
      <div style={field}>
        <span style={caption}>Minimum length of stay — 3 nights</span>
        <Slider defaultValue={3} min={1} max={14} step={1} />
      </div>
      <div style={field}>
        <span style={caption}>Housekeeping staffing — 60%</span>
        <Slider defaultValue={60} step={10} />
      </div>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={field}>
      <span style={caption}>
        Overbooking allowance — locked by the revenue manager
      </span>
      <Slider defaultValue={8} min={0} max={20} disabled />
    </div>
  );
}
