import {
  Badge,
  Button,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle
} from 'tanstack-dashboard-ui';

const panel = { maxWidth: 540 } as const;

const WifiIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path d="M5 12.5a10 10 0 0 1 14 0" strokeLinecap="round" />
    <path d="M8.5 16a5.5 5.5 0 0 1 7 0" strokeLinecap="round" />
    <path d="M12 20h.01" strokeLinecap="round" />
  </svg>
);

const CoffeeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"
      strokeLinejoin="round"
    />
    <path d="M17 9h2a2 2 0 1 1 0 4h-2" strokeLinejoin="round" />
    <path d="M8 2v3M12 2v3" strokeLinecap="round" />
  </svg>
);

const CarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path d="M5 17h14M4 17v-4l2-5h12l2 5v4" strokeLinejoin="round" />
    <circle cx="7.5" cy="17.5" r="1.5" />
    <circle cx="16.5" cy="17.5" r="1.5" />
  </svg>
);

export function Variants() {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 12, ...panel }}
    >
      <Item>
        <ItemContent>
          <ItemTitle>Default</ItemTitle>
          <ItemDescription>
            Transparent surface — used inside cards and lists.
          </ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Outline</ItemTitle>
          <ItemDescription>
            Card background with a border — a standalone row.
          </ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="muted">
        <ItemContent>
          <ItemTitle>Muted</ItemTitle>
          <ItemDescription>
            Recessed surface — secondary information.
          </ItemDescription>
        </ItemContent>
      </Item>
    </div>
  );
}

export function AmenityList() {
  return (
    <ItemGroup style={panel}>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <WifiIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>High-speed Wi-Fi</ItemTitle>
          <ItemDescription>
            Included in every rate plan, no device limit.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge color="emerald">Included</Badge>
        </ItemActions>
      </Item>
      <ItemSeparator />
      <Item variant="outline">
        <ItemMedia variant="icon">
          <CoffeeIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Breakfast buffet</ItemTitle>
          <ItemDescription>
            Served 06:30–10:30 in the ground-floor restaurant.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge variant="outline">EUR 22</Badge>
        </ItemActions>
      </Item>
      <ItemSeparator />
      <Item variant="outline">
        <ItemMedia variant="icon">
          <CarIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Underground parking</ItemTitle>
          <ItemDescription>
            18 spaces, allocated on arrival. Height limit 1.9 m.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Reserve
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  );
}

export function SmallSize() {
  return (
    <ItemGroup style={panel}>
      <Item size="sm" variant="muted">
        <ItemContent>
          <ItemTitle>Room 214 — Anna Krüger</ItemTitle>
        </ItemContent>
        <ItemActions>
          <Badge color="sky">Checked in</Badge>
        </ItemActions>
      </Item>
      <Item size="sm" variant="muted">
        <ItemContent>
          <ItemTitle>Room 118 — Tomas Berg</ItemTitle>
        </ItemContent>
        <ItemActions>
          <Badge color="orange">Arriving 17:30</Badge>
        </ItemActions>
      </Item>
      <Item size="sm" variant="muted">
        <ItemContent>
          <ItemTitle>Suite 507 — Marie Dupont</ItemTitle>
        </ItemContent>
        <ItemActions>
          <Badge variant="outline">Departed</Badge>
        </ItemActions>
      </Item>
    </ItemGroup>
  );
}

export function WithHeaderAndFooter() {
  return (
    <Item variant="outline" style={panel}>
      <ItemHeader>
        <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
          Reservation 4821
        </span>
        <Badge color="emerald">Confirmed</Badge>
      </ItemHeader>
      <ItemMedia variant="icon">
        <CoffeeIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Anna Krüger</ItemTitle>
        <ItemDescription>
          Deluxe double, sea view · 14–17 August · half board
        </ItemDescription>
      </ItemContent>
      <ItemFooter>
        <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
          Balance EUR 606.00
        </span>
        <Button size="sm">Open folio</Button>
      </ItemFooter>
    </Item>
  );
}
