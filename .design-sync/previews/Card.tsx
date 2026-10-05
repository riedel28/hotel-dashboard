import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from 'tanstack-dashboard-ui';

export function Default() {
  return (
    <Card style={{ maxWidth: 460 }}>
      <CardHeader>
        <CardTitle>Reservation 4821</CardTitle>
        <CardDescription>
          Anna Krüger · 3 nights · Deluxe double, sea view
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: 14 }}>
          Arriving Friday 14 August, departing Monday 17 August. Late check-in
          requested — the guest expects to reach the property around 23:00.
        </p>
      </CardContent>
    </Card>
  );
}

export function WithAction() {
  return (
    <Card style={{ maxWidth: 460 }}>
      <CardHeader>
        <CardTitle>Housekeeping</CardTitle>
        <CardDescription>
          Rooms awaiting turnaround this morning.
        </CardDescription>
        <CardAction>
          <Badge color="orange">6 pending</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: 14 }}>
          Floors 2 and 3 are cleared. The remaining rooms on floor 4 are blocked
          until maintenance signs off on the air conditioning.
        </p>
      </CardContent>
    </Card>
  );
}

export function WithFooter() {
  return (
    <Card style={{ maxWidth: 460 }}>
      <CardHeader>
        <CardTitle>Cancel this booking?</CardTitle>
        <CardDescription>
          The guest is inside the free cancellation window, so no fee applies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: 14 }}>
          Cancelling releases room 214 back to inventory and emails the guest a
          confirmation. This can't be undone.
        </p>
      </CardContent>
      <CardFooter
        style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}
      >
        <Button variant="outline">Keep booking</Button>
        <Button variant="destructive">Cancel booking</Button>
      </CardFooter>
    </Card>
  );
}
