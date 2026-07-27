import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Separator
} from 'tanstack-dashboard-ui';

const panel = { maxWidth: 520 } as const;

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 14,
  paddingTop: 8,
  paddingBottom: 8
} as const;

const ChevronIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function FolioBreakdown() {
  return (
    <Collapsible defaultOpen style={panel}>
      <CollapsibleTrigger render={<Button variant="outline" />}>
        Folio 4821 — EUR 640.00
        <ChevronIcon />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div style={{ paddingTop: 12 }}>
          <div style={row}>
            <span>Deluxe double, 3 nights</span>
            <span>EUR 540.00</span>
          </div>
          <Separator />
          <div style={row}>
            <span>City tax</span>
            <span>EUR 21.00</span>
          </div>
          <Separator />
          <div style={row}>
            <span>Minibar, room 214</span>
            <span>EUR 34.00</span>
          </div>
          <Separator />
          <div style={row}>
            <span>Breakfast, 2 guests</span>
            <span>EUR 45.00</span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function OpenAndClosed() {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 20, ...panel }}
    >
      <Collapsible defaultOpen>
        <CollapsibleTrigger render={<Button variant="secondary" />}>
          Arrivals today
          <Badge variant="secondary">8</Badge>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div style={{ paddingTop: 12, fontSize: 14 }}>
            <div style={row}>
              <span>Anna Krüger — room 214</span>
              <span style={{ color: 'var(--muted-foreground)' }}>15:00</span>
            </div>
            <Separator />
            <div style={row}>
              <span>Tomas Berg — room 118</span>
              <span style={{ color: 'var(--muted-foreground)' }}>17:30</span>
            </div>
            <Separator />
            <div style={row}>
              <span>Marie Dupont — suite 507</span>
              <span style={{ color: 'var(--muted-foreground)' }}>21:15</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible>
        <CollapsibleTrigger render={<Button variant="secondary" />}>
          Departures today
          <Badge variant="secondary">5</Badge>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div style={{ paddingTop: 12, fontSize: 14 }}>
            <div style={row}>
              <span>Jonas Weber — room 302</span>
              <span style={{ color: 'var(--muted-foreground)' }}>10:00</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function MaintenanceNotes() {
  return (
    <Collapsible defaultOpen style={panel}>
      <CollapsibleTrigger render={<Button variant="ghost" />}>
        <ChevronIcon />
        Maintenance notes for room 412
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p
          style={{
            paddingTop: 12,
            fontSize: 14,
            color: 'var(--muted-foreground)'
          }}
        >
          The air conditioning was serviced on 12 August. The room stays blocked
          until engineering confirms the condensate line, expected before the
          evening arrivals.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
