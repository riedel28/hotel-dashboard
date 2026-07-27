import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from 'tanstack-dashboard-ui';

// `BreadcrumbLink` renders a TanStack Router `Link` and needs a router in
// context, which a preview cannot provide — see .design-sync/learnings/nav-data.md.
// Ancestor crumbs are plain text here; `BreadcrumbList` already carries the
// muted crumb colour, so the composition reads the way it does in the app.

const ChevronIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Default() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>Dashboard</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>Reservations</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Reservation 4821</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function WithChevronSeparator() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>Back office</BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>Properties</BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>Seehotel Hamburg</BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Rate plans</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function Collapsed() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>Dashboard</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>Room 214</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Housekeeping log</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
