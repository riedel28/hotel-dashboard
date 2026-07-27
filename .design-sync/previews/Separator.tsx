import { Badge, Separator } from 'tanstack-dashboard-ui';

const panel = { maxWidth: 480, fontSize: 14 } as const;

const line = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: 10,
  paddingBottom: 10
} as const;

const muted = { color: 'var(--muted-foreground)' } as const;

export function BetweenFolioLines() {
  return (
    <div style={panel}>
      <div style={line}>
        <span>Deluxe double, 3 nights</span>
        <span>EUR 540.00</span>
      </div>
      <Separator />
      <div style={line}>
        <span>Breakfast, 2 guests</span>
        <span>EUR 45.00</span>
      </div>
      <Separator />
      <div style={line}>
        <span>City tax</span>
        <span>EUR 21.00</span>
      </div>
      <Separator />
      <div style={{ ...line, fontWeight: 500 }}>
        <span>Balance due</span>
        <span>EUR 606.00</span>
      </div>
    </div>
  );
}

export function VerticalInMetaRow() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 12,
        height: 20,
        fontSize: 14,
        ...muted
      }}
    >
      <span>Reservation 4821</span>
      <Separator orientation="vertical" />
      <span>Room 214</span>
      <Separator orientation="vertical" />
      <span>3 nights</span>
      <Separator orientation="vertical" />
      <span>Booking.com</span>
    </div>
  );
}

export function SectionDivider() {
  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Guest details</span>
        <span style={{ fontSize: 14, ...muted }}>
          Anna Krüger · anna.krueger@example.com · +49 30 1234567
        </span>
      </div>
      <div style={{ paddingTop: 16, paddingBottom: 16 }}>
        <Separator />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Stay</span>
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 10,
            height: 26
          }}
        >
          <Badge color="sky">Checked in</Badge>
          <Separator orientation="vertical" />
          <Badge variant="outline">Sea view</Badge>
          <Separator orientation="vertical" />
          <Badge variant="outline">Late check-out</Badge>
        </div>
      </div>
    </div>
  );
}
