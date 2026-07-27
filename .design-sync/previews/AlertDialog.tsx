import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button
} from 'tanstack-dashboard-ui';

const WarningIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
      strokeLinejoin="round"
    />
    <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
  </svg>
);

export function Default() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogTrigger
        render={<Button variant="destructive">Cancel reservation</Button>}
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel reservation 4821?</AlertDialogTitle>
          <AlertDialogDescription>
            Anna Krüger is outside the free cancellation window, so one night
            will be charged to the card on file. Room 214 goes back on sale
            straight away.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep reservation</AlertDialogCancel>
          <AlertDialogAction variant="destructive">
            Cancel and charge
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function WithMedia() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogTrigger
        render={<Button variant="outline">Close the property</Button>}
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <WarningIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>
            Close Seaside Resort for the season?
          </AlertDialogTitle>
          <AlertDialogDescription>
            All 96 rooms stop selling from 1 November. Reservations already on
            the books are kept, but no new bookings will arrive from any channel
            until the property is reopened.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it open</AlertDialogCancel>
          <AlertDialogAction>Close property</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Small() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogTrigger
        render={<Button variant="ghost">Delete rate plan</Button>}
      />
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this rate plan?</AlertDialogTitle>
          <AlertDialogDescription>
            The summer flexible rate is not attached to any future booking.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
