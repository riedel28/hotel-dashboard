import { Progress, ProgressLabel, ProgressValue } from 'tanstack-dashboard-ui';

const stack = {
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  width: 420
} as const;

export function Default() {
  return (
    <Progress value={64} style={{ width: 420 }}>
      <ProgressLabel>Housekeeping progress</ProgressLabel>
      <ProgressValue />
    </Progress>
  );
}

export function Values() {
  return (
    <div style={stack}>
      <Progress value={0}>
        <ProgressLabel>Fourth floor turnaround</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={40}>
        <ProgressLabel>Third floor turnaround</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={100}>
        <ProgressLabel>Second floor turnaround</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  );
}

export function OccupancyCounts() {
  return (
    <div style={stack}>
      <Progress
        value={62}
        max={84}
        format={{ style: 'decimal' }}
        getAriaValueText={(_, value) => `${value} of 84 rooms occupied`}
      >
        <ProgressLabel>Rooms occupied tonight</ProgressLabel>
        <ProgressValue>{(formatted) => `${formatted} / 84`}</ProgressValue>
      </Progress>
      <Progress value={17} max={84} format={{ style: 'decimal' }}>
        <ProgressLabel>Arrivals checked in</ProgressLabel>
        <ProgressValue>{(formatted) => `${formatted} / 84`}</ProgressValue>
      </Progress>
    </div>
  );
}

export function LabelOnly() {
  return (
    <div style={stack}>
      <Progress value={88}>
        <ProgressLabel>Night audit</ProgressLabel>
      </Progress>
      <Progress value={12}>
        <ProgressLabel>Rate export to channel manager</ProgressLabel>
      </Progress>
    </div>
  );
}
