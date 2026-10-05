import { Link } from 'tanstack-dashboard-ui';

// `Link` wraps TanStack Router's `Link` — every cell below needs a router in
// context to render. See .design-sync/learnings/nav-data.md for the exact
// provider ask; the previews are written as the app uses them.

export function Default() {
  return <Link to="/reservations">Back to reservations</Link>;
}

export function InProse() {
  return (
    <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 460 }}>
      Reservation 4821 is held against{' '}
      <Link to="/customers/8814">Anna Krüger's guest profile</Link>. Charges
      post to the folio you can open from <Link to="/payments">Payments</Link>.
    </p>
  );
}

export function External() {
  return (
    <Link href="https://status.example-pms.com" target="_blank">
      Channel manager status page
    </Link>
  );
}

export function Disabled() {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <Link to="/properties">Properties</Link>
      <Link to="/properties/archive" disabled>
        Archived properties
      </Link>
    </div>
  );
}
