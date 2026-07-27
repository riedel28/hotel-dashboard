import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount
} from 'tanstack-dashboard-ui';

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap'
} as const;

const person = { display: 'flex', gap: 10, alignItems: 'center' } as const;

const name = { fontSize: 14, fontWeight: 500, lineHeight: 1.2 } as const;

const meta = { fontSize: 12, opacity: 0.7, lineHeight: 1.2 } as const;

export function Default() {
  return (
    <div style={person}>
      <Avatar>
        <AvatarFallback>MK</AvatarFallback>
      </Avatar>
      <div>
        <div style={name}>Marta Kowalczyk</div>
        <div style={meta}>Front office manager</div>
      </div>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={row}>
      <Avatar size="sm">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar size="default">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar size="xl">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </div>
  );
}

export function WithStatusBadge() {
  return (
    <div style={row}>
      <Avatar size="lg">
        <AvatarFallback>LR</AvatarFallback>
        <AvatarBadge aria-label="On shift" />
      </Avatar>
      <Avatar size="xl">
        <AvatarFallback>TN</AvatarFallback>
        <AvatarBadge aria-label="Verified">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden="true"
          >
            <path
              d="m5 13 4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </AvatarBadge>
      </Avatar>
    </div>
  );
}

export function Group() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <AvatarGroup>
        <Avatar>
          <AvatarFallback>MK</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>LR</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>TN</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+5</AvatarGroupCount>
      </AvatarGroup>
      <AvatarGroup>
        <Avatar size="lg">
          <AvatarFallback>SB</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>HA</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+2</AvatarGroupCount>
      </AvatarGroup>
    </div>
  );
}

export function ShiftRoster() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={person}>
        <Avatar>
          <AvatarFallback>SB</AvatarFallback>
          <AvatarBadge aria-label="On shift" />
        </Avatar>
        <div>
          <div style={name}>Sofia Bergmann</div>
          <div style={meta}>Reception · 07:00–15:00</div>
        </div>
      </div>
      <div style={person}>
        <Avatar>
          <AvatarFallback>HA</AvatarFallback>
        </Avatar>
        <div>
          <div style={name}>Hakan Aydin</div>
          <div style={meta}>Housekeeping · floors 3–5</div>
        </div>
      </div>
      <div style={person}>
        <Avatar>
          <AvatarFallback>NP</AvatarFallback>
        </Avatar>
        <div>
          <div style={name}>Noemi Perrone</div>
          <div style={meta}>Night audit · 23:00–07:00</div>
        </div>
      </div>
    </div>
  );
}
