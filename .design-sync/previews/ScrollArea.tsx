import { Badge, ScrollArea, Separator } from 'tanstack-dashboard-ui';

const frame = {
  height: 240,
  width: 420,
  maxWidth: '100%',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--card)'
} as const;

const rooms = [
  { room: '101', type: 'Standard queen', status: 'Clean' },
  { room: '104', type: 'Standard twin', status: 'Occupied' },
  { room: '118', type: 'Standard queen', status: 'Clean' },
  { room: '204', type: 'Deluxe double', status: 'Dirty' },
  { room: '214', type: 'Deluxe double, sea view', status: 'Occupied' },
  { room: '218', type: 'Deluxe twin', status: 'Clean' },
  { room: '302', type: 'Junior suite', status: 'Dirty' },
  { room: '308', type: 'Junior suite', status: 'Clean' },
  { room: '401', type: 'Family room', status: 'Out of order' },
  { room: '412', type: 'Family room', status: 'Occupied' },
  { room: '505', type: 'Panorama suite', status: 'Clean' },
  { room: '507', type: 'Panorama suite', status: 'Occupied' }
];

export function RoomList() {
  return (
    <ScrollArea style={frame}>
      <div style={{ padding: 12 }}>
        {rooms.map((r, i) => (
          <div key={r.room}>
            {i > 0 ? <Separator /> : null}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                paddingTop: 10,
                paddingBottom: 10,
                fontSize: 14
              }}
            >
              <span style={{ fontWeight: 500, width: 44 }}>{r.room}</span>
              <span
                style={{
                  flex: 1,
                  color: 'var(--muted-foreground)'
                }}
              >
                {r.type}
              </span>
              <Badge variant="outline">{r.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function PolicyText() {
  return (
    <ScrollArea style={{ ...frame, height: 200 }}>
      <div
        style={{
          padding: 16,
          fontSize: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <p style={{ fontWeight: 500 }}>Group booking terms</p>
        <p style={{ color: 'var(--muted-foreground)' }}>
          A rooming list is due 21 days before arrival. Rooms released after
          that deadline return to general inventory at the prevailing rate.
        </p>
        <p style={{ color: 'var(--muted-foreground)' }}>
          A deposit of 30 percent is invoiced on contract signature. The balance
          is due on departure unless a credit account has been agreed with the
          finance office.
        </p>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Cancellations between 21 and 7 days before arrival are charged at 50
          percent of the contracted value. Inside 7 days the full value applies.
        </p>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Meeting space is held provisionally and confirmed once the rooming
          list is received. Catering headcounts are final 72 hours before the
          event.
        </p>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Complimentary rooms are granted at one per twenty paid room nights and
          applied to the master account.
        </p>
      </div>
    </ScrollArea>
  );
}
