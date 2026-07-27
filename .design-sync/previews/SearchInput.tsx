import { SearchInput } from 'tanstack-dashboard-ui';

const box = { width: 320 } as const;

const stack = { display: 'flex', flexDirection: 'column', gap: 12 } as const;

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'flex-start',
  flexWrap: 'wrap'
} as const;

const field = { display: 'flex', flexDirection: 'column', gap: 6 } as const;

const caption = {
  fontSize: 12,
  color: 'var(--color-muted-foreground, #6b7280)'
} as const;

export function Default() {
  return (
    <div style={box}>
      <SearchInput placeholder="Search reservations" />
    </div>
  );
}

export function Filled() {
  return (
    <div style={box}>
      <SearchInput placeholder="Search reservations" value="Bergström" />
    </div>
  );
}

export function Disabled() {
  return (
    <div style={box}>
      <SearchInput placeholder="Search reservations" disabled />
    </div>
  );
}

export function InAToolbar() {
  return (
    <div style={stack}>
      <div style={row}>
        <div style={{ ...field, width: 260 }}>
          <span style={caption}>Guest or booking reference</span>
          <SearchInput placeholder="Search reservations" debounceMs={300} />
        </div>
        <div style={{ ...field, width: 200 }}>
          <span style={caption}>Room number</span>
          <SearchInput placeholder="e.g. 214" value="21" />
        </div>
      </div>
      <div style={{ width: 480 }}>
        <SearchInput placeholder="Search the whole property directory" />
      </div>
    </div>
  );
}
