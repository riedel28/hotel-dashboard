import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Separator
} from 'tanstack-dashboard-ui';

const stage = {
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 16,
  paddingBottom: 16
} as const;

const meta = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  marginTop: 12,
  fontSize: 13
} as const;

const metaRow = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12
} as const;

export function GuestProfile() {
  return (
    <div style={stage}>
      <HoverCard defaultOpen>
        <HoverCardTrigger
          render={<Button variant="link">Anna Krüger</Button>}
        />
        <HoverCardContent>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Avatar>
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <div>
              <div style={{ fontWeight: 500 }}>Anna Krüger</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                anna.krueger@mail.de
              </div>
            </div>
          </div>
          <Separator style={{ marginTop: 12 }} />
          <div style={meta}>
            <div style={metaRow}>
              <span style={{ opacity: 0.7 }}>Phone</span>
              <span>+49 30 5540 118</span>
            </div>
            <div style={metaRow}>
              <span style={{ opacity: 0.7 }}>Stays</span>
              <span>7 since 2021</span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

export function RatePlanSummary() {
  return (
    <div style={stage}>
      <HoverCard defaultOpen>
        <HoverCardTrigger
          render={<Button variant="link">Summer flexible</Button>}
        />
        <HoverCardContent>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8
            }}
          >
            <span style={{ fontWeight: 500 }}>Summer flexible</span>
            <Badge color="emerald">Active</Badge>
          </div>
          <p style={{ fontSize: 13, opacity: 0.75, marginTop: 8 }}>
            Free cancellation until 18:00 on the arrival day. Breakfast included
            for two adults.
          </p>
          <div style={meta}>
            <div style={metaRow}>
              <span style={{ opacity: 0.7 }}>From</span>
              <span>€148 / night</span>
            </div>
            <div style={metaRow}>
              <span style={{ opacity: 0.7 }}>Valid</span>
              <span>1 Jun – 30 Sep</span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

export function RoomStatus() {
  return (
    <div style={stage}>
      <HoverCard defaultOpen>
        <HoverCardTrigger render={<Button variant="link">Room 214</Button>} />
        <HoverCardContent side="right" align="start">
          <div style={{ fontWeight: 500 }}>214 · Deluxe double</div>
          <p style={{ fontSize: 13, opacity: 0.75, marginTop: 8 }}>
            Sea view, 28 m², king bed. Out of service while the air conditioning
            is repaired.
          </p>
          <div style={meta}>
            <div style={metaRow}>
              <span style={{ opacity: 0.7 }}>Housekeeping</span>
              <span>Inspected</span>
            </div>
            <div style={metaRow}>
              <span style={{ opacity: 0.7 }}>Back on sale</span>
              <span>16 August</span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
