import { Separator, Skeleton } from 'tanstack-dashboard-ui';

const card = {
  width: 460,
  maxWidth: '100%',
  border: '1px solid var(--border)',
  borderRadius: 12,
  background: 'var(--card)',
  padding: 16
} as const;

export function ReservationCardLoading() {
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Skeleton style={{ width: 40, height: 40, borderRadius: '50%' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton style={{ width: 160, height: 14 }} />
          <Skeleton style={{ width: 220, height: 12 }} />
        </div>
        <Skeleton
          style={{ width: 72, height: 24, marginLeft: 'auto', borderRadius: 8 }}
        />
      </div>
      <div style={{ paddingTop: 16, paddingBottom: 16 }}>
        <Separator />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skeleton style={{ width: '100%', height: 12 }} />
        <Skeleton style={{ width: '92%', height: 12 }} />
        <Skeleton style={{ width: '60%', height: 12 }} />
      </div>
    </div>
  );
}

export function ArrivalsTableLoading() {
  return (
    <div style={card}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          paddingBottom: 12
        }}
      >
        <Skeleton style={{ width: 56, height: 12 }} />
        <Skeleton style={{ width: 140, height: 12 }} />
        <Skeleton style={{ width: 80, height: 12, marginLeft: 'auto' }} />
      </div>
      <Separator />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i}>
          {i > 0 ? <Separator /> : null}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              paddingTop: 12,
              paddingBottom: 12
            }}
          >
            <Skeleton style={{ width: 40, height: 14 }} />
            <Skeleton style={{ width: 180, height: 14 }} />
            <Skeleton
              style={{
                width: 68,
                height: 22,
                marginLeft: 'auto',
                borderRadius: 8
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OccupancyTilesLoading() {
  return (
    <div style={{ display: 'flex', gap: 12, width: 520, maxWidth: '100%' }}>
      {['Occupancy', 'ADR', 'RevPAR'].map((label) => (
        <div
          key={label}
          style={{
            flex: 1,
            border: '1px solid var(--border)',
            borderRadius: 12,
            background: 'var(--card)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          <Skeleton style={{ width: 84, height: 12 }} />
          <Skeleton style={{ width: 116, height: 28 }} />
          <Skeleton style={{ width: 64, height: 10 }} />
        </div>
      ))}
    </div>
  );
}
