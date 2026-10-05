import { Button } from 'tanstack-dashboard-ui';

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap'
} as const;

export function Variants() {
  return (
    <div style={row}>
      <Button>Check in guest</Button>
      <Button variant="secondary">Assign room</Button>
      <Button variant="outline">View folio</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive">Cancel booking</Button>
      <Button variant="link">Forgot password?</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={row}>
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}

export function WithIcon() {
  return (
    <div style={row}>
      <Button>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        New reservation
      </Button>
      <Button variant="outline" size="icon" aria-label="Refresh">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={row}>
      <Button disabled>Check in guest</Button>
      <Button variant="outline" disabled>
        View folio
      </Button>
      <Button variant="destructive" disabled>
        Cancel booking
      </Button>
    </div>
  );
}
