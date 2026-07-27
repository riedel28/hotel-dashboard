import {
  CopyButton,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Label
} from 'tanstack-dashboard-ui';

const field = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  width: 360
} as const;

const detailRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  width: 360
} as const;

const detailLabel = { fontSize: 12, opacity: 0.7 } as const;

const detailValue = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 14,
  fontVariantNumeric: 'tabular-nums'
} as const;

export function Default() {
  return (
    <div style={field}>
      <Label htmlFor="confirmation-code">Confirmation code</Label>
      <InputGroup>
        <InputGroupInput
          id="confirmation-code"
          readOnly
          value="RES-2026-04871"
        />
        <InputGroupAddon align="inline-end">
          <CopyButton text="RES-2026-04871" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export function InReservationDetails() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={detailRow}>
        <span style={detailLabel}>Reservation ID</span>
        <span style={detailValue}>
          RES-2026-04871
          <CopyButton text="RES-2026-04871" />
        </span>
      </div>
      <div style={detailRow}>
        <span style={detailLabel}>Guest email</span>
        <span style={detailValue}>
          m.kowalczyk@example.com
          <CopyButton text="m.kowalczyk@example.com" />
        </span>
      </div>
      <div style={detailRow}>
        <span style={detailLabel}>Folio number</span>
        <span style={detailValue}>
          FOL-88213
          <CopyButton text="FOL-88213" />
        </span>
      </div>
    </div>
  );
}

export function CustomLabels() {
  return (
    <div style={field}>
      <Label htmlFor="channel-api-key">Channel manager API key</Label>
      <InputGroup>
        <InputGroupInput
          id="channel-api-key"
          readOnly
          value="pk_live_9f2c41ba7d0e"
        />
        <InputGroupAddon align="inline-end">
          <CopyButton
            text="pk_live_9f2c41ba7d0e"
            copyLabel="Copy API key"
            copiedLabel="API key copied"
          />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
