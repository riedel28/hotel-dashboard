import { Toggle } from 'tanstack-dashboard-ui';

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap'
} as const;

const stack = { display: 'flex', flexDirection: 'column', gap: 12 } as const;

const caption = { fontSize: 12, opacity: 0.7 } as const;

const StarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.8l6.5-.9Z"
      strokeLinejoin="round"
    />
  </svg>
);

const BellIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function Default() {
  return (
    <div style={row}>
      <Toggle defaultPressed>
        <StarIcon />
        VIP guest
      </Toggle>
      <Toggle>
        <BellIcon />
        Wake-up call
      </Toggle>
    </div>
  );
}

export function Variants() {
  return (
    <div style={stack}>
      <div style={row}>
        <span style={caption}>default</span>
        <Toggle>Breakfast</Toggle>
        <Toggle pressed>Airport transfer</Toggle>
      </div>
      <div style={row}>
        <span style={caption}>outline</span>
        <Toggle variant="outline">Breakfast</Toggle>
        <Toggle variant="outline" pressed>
          Airport transfer
        </Toggle>
      </div>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={row}>
      <Toggle variant="outline" size="sm">
        Sea view
      </Toggle>
      <Toggle variant="outline" size="default">
        Sea view
      </Toggle>
      <Toggle variant="outline" size="lg">
        Sea view
      </Toggle>
    </div>
  );
}

export function IconOnly() {
  return (
    <div style={row}>
      <Toggle aria-label="Mark reservation as VIP" defaultPressed>
        <StarIcon />
      </Toggle>
      <Toggle variant="outline" aria-label="Notify on arrival">
        <BellIcon />
      </Toggle>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={row}>
      <Toggle disabled>Late checkout</Toggle>
      <Toggle disabled pressed>
        Late checkout
      </Toggle>
      <Toggle variant="outline" disabled>
        Connecting rooms
      </Toggle>
    </div>
  );
}
