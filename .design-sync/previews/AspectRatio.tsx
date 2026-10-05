import { AspectRatio, Badge } from 'tanstack-dashboard-ui';

const fill = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: 8,
  borderRadius: 10,
  background: 'var(--muted)',
  border: '1px solid var(--border)',
  color: 'var(--muted-foreground)',
  fontSize: 13
} as const;

const PhotoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
    style={{ width: 28, height: 28 }}
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="m21 16-4.5-5L9 20" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function RoomPhoto() {
  return (
    <div style={{ width: 420, maxWidth: '100%' }}>
      <AspectRatio ratio={16 / 9}>
        <div style={fill}>
          <PhotoIcon />
          <span>Deluxe double, sea view — hero image</span>
        </div>
      </AspectRatio>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 10,
          fontSize: 14
        }}
      >
        <span style={{ fontWeight: 500 }}>Room 214</span>
        <Badge variant="outline">16:9</Badge>
      </div>
    </div>
  );
}

export function GalleryRatios() {
  return (
    <div style={{ display: 'flex', gap: 16, width: 520, maxWidth: '100%' }}>
      <div style={{ flex: 2 }}>
        <AspectRatio ratio={16 / 9}>
          <div style={fill}>
            <PhotoIcon />
            <span>16:9 — listing hero</span>
          </div>
        </AspectRatio>
      </div>
      <div style={{ flex: 1.5 }}>
        <AspectRatio ratio={4 / 3}>
          <div style={fill}>
            <span>4:3 — gallery</span>
          </div>
        </AspectRatio>
      </div>
      <div style={{ flex: 1 }}>
        <AspectRatio ratio={1}>
          <div style={fill}>
            <span>1:1 — thumb</span>
          </div>
        </AspectRatio>
      </div>
    </div>
  );
}

export function PropertyMapPanel() {
  return (
    <div style={{ width: 380, maxWidth: '100%' }}>
      <AspectRatio ratio={3 / 2}>
        <div
          style={{
            ...fill,
            background:
              'repeating-linear-gradient(45deg, var(--muted) 0 22px, var(--border) 22px 24px)'
          }}
        >
          <span
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 10px',
              color: 'var(--foreground)'
            }}
          >
            Property map — Strandhotel Nordwind
          </span>
        </div>
      </AspectRatio>
    </div>
  );
}
