import { Badge } from 'tanstack-dashboard-ui';

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap'
} as const;

const stack = { display: 'flex', flexDirection: 'column', gap: 10 } as const;

const DotIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="12" r="6" />
  </svg>
);

export function Default() {
  return (
    <div style={row}>
      <Badge>Checked in</Badge>
      <Badge variant="secondary">Awaiting deposit</Badge>
      <Badge variant="info">Late arrival</Badge>
      <Badge variant="destructive">Payment failed</Badge>
    </div>
  );
}

export function Variants() {
  return (
    <div style={row}>
      <Badge variant="default">Confirmed</Badge>
      <Badge variant="secondary">Tentative</Badge>
      <Badge variant="destructive">No-show</Badge>
      <Badge variant="outline">Walk-in</Badge>
      <Badge variant="ghost">Draft</Badge>
      <Badge variant="info">Group booking</Badge>
      <Badge variant="link">Folio 4871</Badge>
    </div>
  );
}

export function Colors() {
  return (
    <div style={stack}>
      <div style={row}>
        <Badge color="gray">Unassigned</Badge>
        <Badge color="emerald">Vacant clean</Badge>
        <Badge color="teal">Inspected</Badge>
        <Badge color="sky">Arriving today</Badge>
        <Badge color="indigo">In house</Badge>
        <Badge color="fuchsia">VIP guest</Badge>
      </div>
      <div style={row}>
        <Badge color="yellow">Vacant dirty</Badge>
        <Badge color="orange">Late checkout</Badge>
        <Badge color="pink">Honeymoon</Badge>
        <Badge color="red">Out of order</Badge>
        <Badge color="rose">Cancelled</Badge>
      </div>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={row}>
      <Badge size="xs">Room 214</Badge>
      <Badge size="sm">Room 214</Badge>
      <Badge size="md">Room 214</Badge>
      <Badge size="lg">Room 214</Badge>
    </div>
  );
}

export function WithIcon() {
  return (
    <div style={row}>
      <Badge color="emerald">
        <DotIcon />
        Vacant clean
      </Badge>
      <Badge color="yellow">
        <DotIcon />
        Vacant dirty
      </Badge>
      <Badge color="red">
        <DotIcon />
        Out of order
      </Badge>
      <Badge variant="outline">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            d="M3 21V8l9-5 9 5v13M9 21v-6h6v6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Deluxe suite
      </Badge>
    </div>
  );
}
