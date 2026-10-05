import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Textarea
} from 'tanstack-dashboard-ui';

const field = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6
} as const;

const row = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12
} as const;

export function Default() {
  return (
    <Dialog defaultOpen>
      <DialogTrigger render={<Button variant="outline">Move guest</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move guest to another room</DialogTitle>
          <DialogDescription>
            Room 214 is out of service until the air conditioning is repaired.
            Anna Krüger will be notified once the move is confirmed.
          </DialogDescription>
        </DialogHeader>
        <div style={row}>
          <div style={field}>
            <Label>Current room</Label>
            <Input defaultValue="214 · Deluxe double" readOnly />
          </div>
          <div style={field}>
            <Label>New room</Label>
            <Input defaultValue="317 · Deluxe double" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose
            render={<Button variant="outline">Keep room 214</Button>}
          />
          <Button>Confirm move</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WithForm() {
  return (
    <Dialog defaultOpen>
      <DialogTrigger render={<Button>Add guest note</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a note to reservation 4821</DialogTitle>
          <DialogDescription>
            Notes are visible to the front desk and to housekeeping.
          </DialogDescription>
        </DialogHeader>
        <div style={field}>
          <Label>Subject</Label>
          <Input defaultValue="Late arrival — around 23:00" />
        </div>
        <div style={field}>
          <Label>Details</Label>
          <Textarea
            rows={3}
            defaultValue="Guest is driving from Munich and asked us to hold the room. Leave the key with the night porter if reception is unstaffed."
          />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button>Save note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WithoutCloseButton() {
  return (
    <Dialog defaultOpen>
      <DialogTrigger
        render={<Button variant="destructive">Release block</Button>}
      />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Release the maintenance block?</DialogTitle>
          <DialogDescription>
            Rooms 401–408 return to sellable inventory immediately and the
            channel manager pushes the new availability within a few minutes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Not yet</Button>} />
          <Button variant="destructive">Release 8 rooms</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FooterCloseButton() {
  return (
    <Dialog defaultOpen>
      <DialogTrigger
        render={<Button variant="secondary">Night audit</Button>}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Night audit finished</DialogTitle>
          <DialogDescription>
            142 reservations were rolled over, 3 no-shows were charged and the
            daily revenue report is ready in Reporting.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
