import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea
} from 'tanstack-dashboard-ui';

const stack = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  maxWidth: 420
} as const;
const caption = {
  fontSize: 12,
  color: 'var(--color-muted-foreground)'
} as const;
const icon = { width: 16, height: 16 } as const;

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
    style={icon}
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
    style={icon}
  >
    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
  </svg>
);

const PaperclipIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
    style={icon}
  >
    <path
      d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 0 1 5 5L10.5 18"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function Default() {
  return (
    <div style={{ maxWidth: 420 }}>
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search guests, rooms or reservation IDs" />
      </InputGroup>
    </div>
  );
}

export function AddonAlignment() {
  return (
    <div style={stack}>
      <div>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <InputGroupText>€</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput defaultValue="320.00" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>per night</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <p style={caption}>inline-start + inline-end</p>
      </div>
      <div>
        <InputGroup>
          <InputGroupAddon align="block-start">
            <InputGroupText>Message to guest — Amelia Hartwig</InputGroupText>
          </InputGroupAddon>
          <InputGroupTextarea
            rows={3}
            defaultValue="Your room is ready ahead of schedule. Collect the key card whenever it suits you."
          />
        </InputGroup>
        <p style={caption}>block-start</p>
      </div>
      <div>
        <InputGroup>
          <InputGroupTextarea
            rows={3}
            placeholder="Add an internal note for the night shift…"
          />
          <InputGroupAddon align="block-end">
            <InputGroupButton size="icon-xs" aria-label="Attach a file">
              <PaperclipIcon />
            </InputGroupButton>
            <InputGroupButton variant="outline">Save note</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <p style={caption}>block-end</p>
      </div>
    </div>
  );
}

export function WithButtons() {
  return (
    <div style={stack}>
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput defaultValue="Hartwig" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear search">
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Promotion code" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="outline">Apply</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>RSV-</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput defaultValue="40182" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Look up</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export function States() {
  return (
    <div style={stack}>
      <div>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>€</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput aria-invalid defaultValue="-40.00" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>deposit</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <p style={caption}>Invalid</p>
      </div>
      <div>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput disabled defaultValue="Folio closed" />
        </InputGroup>
        <p style={caption}>Disabled</p>
      </div>
    </div>
  );
}
