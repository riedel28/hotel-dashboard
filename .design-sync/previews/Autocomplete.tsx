import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup
} from 'tanstack-dashboard-ui';

const box = { width: 320 } as const;

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

const guests = [
  'Anneke Bergström',
  'Marco Ferretti',
  'Priya Raghunathan',
  'Tomás Oliveira',
  'Yuki Nakamura'
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
      <Autocomplete items={guests}>
        <AutocompleteInput
          aria-label="Search for a guest"
          placeholder="Search for a guest..."
          startAddon={<SearchGlyph />}
        />
        <AutocompletePopup>
          <AutocompleteEmpty>No guests found</AutocompleteEmpty>
          <AutocompleteList>
            {(item: string) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </div>
  );
}

export function FilledAndDisabled() {
  return (
    <div style={row}>
      <div style={{ ...field, ...box }}>
        <span style={caption}>filled, clear button</span>
        <Autocomplete items={guests} defaultValue="Anneke Bergström">
          <AutocompleteInput
            aria-label="Search for a guest"
            showClear
            startAddon={<SearchGlyph />}
          />
          <AutocompletePopup>
            <AutocompleteEmpty>No guests found</AutocompleteEmpty>
            <AutocompleteList>
              {(item: string) => (
                <AutocompleteItem key={item} value={item}>
                  {item}
                </AutocompleteItem>
              )}
            </AutocompleteList>
          </AutocompletePopup>
        </Autocomplete>
      </div>
      <div style={{ ...field, ...box }}>
        <span style={caption}>disabled</span>
        <Autocomplete items={guests} disabled>
          <AutocompleteInput
            aria-label="Search for a guest"
            disabled
            placeholder="Search for a guest..."
            startAddon={<SearchGlyph />}
          />
          <AutocompletePopup>
            <AutocompleteList>
              {(item: string) => (
                <AutocompleteItem key={item} value={item}>
                  {item}
                </AutocompleteItem>
              )}
            </AutocompleteList>
          </AutocompletePopup>
        </Autocomplete>
      </div>
    </div>
  );
}

export function WithTrigger() {
  return (
    <div style={box}>
      <Autocomplete items={guests}>
        <AutocompleteInput
          aria-label="Search for a guest"
          placeholder="Search for a guest..."
          showTrigger
        />
        <AutocompletePopup>
          <AutocompleteEmpty>No guests found</AutocompleteEmpty>
          <AutocompleteList>
            {(item: string) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </div>
  );
}

export function OpenWithResults() {
  return (
    <div style={box}>
      <Autocomplete items={guests} defaultOpen>
        <AutocompleteInput
          aria-label="Search for a guest"
          placeholder="Search for a guest..."
          startAddon={<SearchGlyph />}
        />
        <AutocompletePopup>
          <AutocompleteEmpty>No guests found</AutocompleteEmpty>
          <AutocompleteList>
            {(item: string) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </div>
  );
}
