import { Alert, AlertDescription, AlertTitle } from 'tanstack-dashboard-ui';

const stack = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  maxWidth: 520
} as const;

const InfoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
  </svg>
);

const WarnIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
      strokeLinejoin="round"
    />
    <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
  </svg>
);

export function Default() {
  return (
    <Alert style={{ maxWidth: 520 }}>
      <InfoIcon />
      <AlertTitle>Rate plan updated</AlertTitle>
      <AlertDescription>
        Changes to the summer rate plan apply to reservations created from
        tomorrow. Existing bookings keep the rate they were quoted.
      </AlertDescription>
    </Alert>
  );
}

export function Variants() {
  return (
    <div style={stack}>
      <Alert>
        <InfoIcon />
        <AlertTitle>Night audit scheduled</AlertTitle>
        <AlertDescription>
          The audit runs at 03:00. Reporting is read-only while it completes.
        </AlertDescription>
      </Alert>
      <Alert variant="warning">
        <WarnIcon />
        <AlertTitle>Overbooked for 14 August</AlertTitle>
        <AlertDescription>
          Two more reservations than sellable rooms. Move guests to a partner
          property or release a maintenance block.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <WarnIcon />
        <AlertTitle>Payment provider unreachable</AlertTitle>
        <AlertDescription>
          Card authorisations are failing. Take payment on arrival until the
          connection is restored.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function TitleOnly() {
  return (
    <div style={stack}>
      <Alert>
        <AlertTitle>Room 214 is ready for the next guest.</AlertTitle>
      </Alert>
      <Alert variant="warning">
        <WarnIcon />
        <AlertTitle>Three keys have not been returned.</AlertTitle>
      </Alert>
    </div>
  );
}
