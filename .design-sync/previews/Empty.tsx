import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from 'tanstack-dashboard-ui';

const panel = {
  width: 520,
  maxWidth: '100%',
  border: '1px solid var(--border)'
} as const;

const dashed = {
  ...panel,
  borderStyle: 'dashed'
} as const;

const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
  </svg>
);

const SearchIcon = () => (
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

const InboxIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path d="M3 13h5l1.5 3h5L16 13h5" strokeLinejoin="round" />
    <path
      d="M4.5 5.5h15L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5l1.5-7.5Z"
      strokeLinejoin="round"
    />
  </svg>
);

export function NoReservations() {
  return (
    <Empty style={dashed}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarIcon />
        </EmptyMedia>
        <EmptyTitle>No reservations match these filters</EmptyTitle>
        <EmptyDescription>
          Nothing arrives between 14 and 17 August for the Deluxe rate plan. Try
          widening the date range or clearing the rate filter.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button variant="outline">Clear filters</Button>
          <Button>New reservation</Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}

export function NoSearchResults() {
  return (
    <Empty style={panel}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchIcon />
        </EmptyMedia>
        <EmptyTitle>No guests found</EmptyTitle>
        <EmptyDescription>
          No profile matches “krügner”. Check the spelling or search by
          reservation number instead.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function EmptyInbox() {
  return (
    <Empty style={dashed}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>All guest requests are handled</EmptyTitle>
        <EmptyDescription>
          The last open request for room 412 was closed at 09:20. New requests
          appear here as soon as reception logs them.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">View closed requests</Button>
      </EmptyContent>
    </Empty>
  );
}
