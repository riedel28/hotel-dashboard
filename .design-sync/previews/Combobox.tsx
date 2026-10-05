import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue
} from 'tanstack-dashboard-ui';

const box = { width: 300 } as const;

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

const roomTypes = [
  'Single, city view',
  'Double, sea view',
  'Twin, courtyard',
  'Junior suite',
  'Terrace suite'
];

const services = [
  'Late checkout',
  'Airport transfer',
  'Crib in room',
  'Breakfast in room',
  'Parking space'
];

const roomsByStatus = [
  {
    value: 'Ready to sell',
    items: [
      '214 — Double, sea view',
      '216 — Double, sea view',
      '301 — Junior suite'
    ]
  },
  {
    value: 'Being cleaned',
    items: ['118 — Twin, courtyard', '402 — Terrace suite (maintenance)']
  }
];

const SearchGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

export function Default() {
  return (
    <div style={box}>
      <Combobox items={roomTypes}>
        <ComboboxInput placeholder="Assign a room type" />
        <ComboboxContent>
          <ComboboxEmpty>No room type matches that search.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function FilledAndDisabled() {
  return (
    <div style={row}>
      <div style={{ ...field, ...box }}>
        <span style={caption}>filled, clear button</span>
        <Combobox items={roomTypes} defaultValue="Double, sea view">
          <ComboboxInput
            showClear
            showTrigger={false}
            iconLeft={<SearchGlyph />}
          />
          <ComboboxContent>
            <ComboboxEmpty>No room type matches that search.</ComboboxEmpty>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <div style={{ ...field, ...box }}>
        <span style={caption}>disabled</span>
        <Combobox items={roomTypes} disabled>
          <ComboboxInput
            disabled
            placeholder="Assign a room type"
            iconLeft={<SearchGlyph />}
          />
          <ComboboxContent>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  );
}

export function MultipleWithChips() {
  return (
    <div style={box}>
      <Combobox
        items={services}
        multiple
        defaultValue={['Late checkout', 'Airport transfer']}
      >
        <ComboboxChips>
          <ComboboxValue>
            {(selected: string[]) =>
              selected.map((service) => (
                <ComboboxChip key={service}>{service}</ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxChipsInput placeholder="Add a service" />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxEmpty>No service matches that search.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function OpenWithGroups() {
  return (
    <div style={box}>
      <Combobox items={roomsByStatus} defaultOpen>
        <ComboboxInput placeholder="Assign a room" iconLeft={<SearchGlyph />} />
        <ComboboxContent>
          <ComboboxEmpty>No room matches that search.</ComboboxEmpty>
          <ComboboxList>
            {(group: { value: string; items: string[] }) => (
              <ComboboxGroup key={group.value} items={group.items}>
                <ComboboxLabel>{group.value}</ComboboxLabel>
                <ComboboxCollection>
                  {(room: string) => (
                    <ComboboxItem
                      key={room}
                      value={room}
                      disabled={room.includes('maintenance')}
                    >
                      {room}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
