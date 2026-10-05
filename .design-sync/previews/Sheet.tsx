import {
  Badge,
  Button,
  Checkbox,
  Input,
  Label,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from 'tanstack-dashboard-ui';

const body = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: '0 16px',
  fontSize: 14
} as const;

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12
} as const;

const check = {
  display: 'flex',
  alignItems: 'center',
  gap: 8
} as const;

export function Default() {
  return (
    <Sheet defaultOpen>
      <SheetTrigger asChild>
        <Button variant="outline">Guest details</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Anna Krüger</SheetTitle>
          <SheetDescription>
            Reservation 4821 · 3 nights · Deluxe double, sea view
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div style={body}>
          <div style={row}>
            <span style={{ opacity: 0.7 }}>Arrival</span>
            <span>Fri 14 August, 23:00</span>
          </div>
          <div style={row}>
            <span style={{ opacity: 0.7 }}>Departure</span>
            <span>Mon 17 August</span>
          </div>
          <div style={row}>
            <span style={{ opacity: 0.7 }}>Room</span>
            <span>214</span>
          </div>
          <div style={row}>
            <span style={{ opacity: 0.7 }}>Balance</span>
            <Badge color="orange">€444 due</Badge>
          </div>
        </div>
        <SheetFooter>
          <Button>Check in guest</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function LeftSide() {
  return (
    <Sheet defaultOpen>
      <SheetTrigger asChild>
        <Button variant="secondary">Filter arrivals</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Filter arrivals</SheetTitle>
          <SheetDescription>
            Narrow today's arrival list before printing the run sheet.
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div style={body}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label>Guest or reservation</Label>
            <Input placeholder="Search by name or number" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontWeight: 500 }}>Status</span>
            <div style={check}>
              <Checkbox defaultChecked id="sheet-status-due" />
              <Label htmlFor="sheet-status-due">Due in</Label>
            </div>
            <div style={check}>
              <Checkbox id="sheet-status-in" />
              <Label htmlFor="sheet-status-in">Checked in</Label>
            </div>
            <div style={check}>
              <Checkbox id="sheet-status-noshow" />
              <Label htmlFor="sheet-status-noshow">No show</Label>
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button>Apply filters</Button>
          <SheetClose asChild>
            <Button variant="ghost">Reset</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function BottomSide() {
  return (
    <Sheet defaultOpen>
      <SheetTrigger asChild>
        <Button>Night audit</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Run the night audit</SheetTitle>
          <SheetDescription>
            Reporting is read-only until the audit finishes. It usually takes
            under two minutes.
          </SheetDescription>
        </SheetHeader>
        <div style={body}>
          <div style={row}>
            <span style={{ opacity: 0.7 }}>Reservations to roll over</span>
            <span>142</span>
          </div>
          <div style={row}>
            <span style={{ opacity: 0.7 }}>No-shows to charge</span>
            <span>3</span>
          </div>
        </div>
        <SheetFooter
          style={{ flexDirection: 'row', justifyContent: 'flex-end' }}
        >
          <SheetClose asChild>
            <Button variant="outline">Later</Button>
          </SheetClose>
          <Button>Start audit</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
