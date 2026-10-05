import { ToggleGroup, ToggleGroupItem } from 'tanstack-dashboard-ui';

const stack = { display: 'flex', flexDirection: 'column', gap: 12 } as const;

const label = { fontSize: 12, opacity: 0.7 } as const;

export function Default() {
  return (
    <ToggleGroup variant="outline" defaultValue={['arrivals']}>
      <ToggleGroupItem value="arrivals">Arrivals</ToggleGroupItem>
      <ToggleGroupItem value="in-house">In house</ToggleGroupItem>
      <ToggleGroupItem value="departures">Departures</ToggleGroupItem>
    </ToggleGroup>
  );
}

export function MultipleSelection() {
  return (
    <div style={stack}>
      <span style={label}>Room amenities</span>
      <ToggleGroup
        variant="outline"
        multiple
        spacing={2}
        defaultValue={['balcony', 'sea-view']}
      >
        <ToggleGroupItem value="balcony">Balcony</ToggleGroupItem>
        <ToggleGroupItem value="sea-view">Sea view</ToggleGroupItem>
        <ToggleGroupItem value="accessible">Accessible</ToggleGroupItem>
        <ToggleGroupItem value="pet-friendly">Pet friendly</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

export function Variants() {
  return (
    <div style={stack}>
      <div style={stack}>
        <span style={label}>default</span>
        <ToggleGroup spacing={1} defaultValue={['week']}>
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div style={stack}>
        <span style={label}>outline</span>
        <ToggleGroup variant="outline" defaultValue={['week']}>
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

export function Sizes() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
    >
      <ToggleGroup variant="outline" size="sm" defaultValue={['clean']}>
        <ToggleGroupItem value="clean">Clean</ToggleGroupItem>
        <ToggleGroupItem value="dirty">Dirty</ToggleGroupItem>
        <ToggleGroupItem value="inspected">Inspected</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup variant="outline" size="lg" defaultValue={['clean']}>
        <ToggleGroupItem value="clean">Clean</ToggleGroupItem>
        <ToggleGroupItem value="dirty">Dirty</ToggleGroupItem>
        <ToggleGroupItem value="inspected">Inspected</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

export function Vertical() {
  return (
    <div style={stack}>
      <span style={label}>Floor</span>
      <ToggleGroup
        variant="outline"
        orientation="vertical"
        defaultValue={['floor-3']}
      >
        <ToggleGroupItem value="floor-1">Floor 1</ToggleGroupItem>
        <ToggleGroupItem value="floor-2">Floor 2</ToggleGroupItem>
        <ToggleGroupItem value="floor-3">Floor 3</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

export function Disabled() {
  return (
    <ToggleGroup variant="outline" disabled defaultValue={['departures']}>
      <ToggleGroupItem value="arrivals">Arrivals</ToggleGroupItem>
      <ToggleGroupItem value="in-house">In house</ToggleGroupItem>
      <ToggleGroupItem value="departures">Departures</ToggleGroupItem>
    </ToggleGroup>
  );
}
