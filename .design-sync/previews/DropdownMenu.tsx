import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from 'tanstack-dashboard-ui';

const stage = {
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 12,
  paddingBottom: 12
} as const;

const menuWidth = { width: 232 } as const;

const MoreIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <circle cx="12" cy="5" r="1.4" fill="currentColor" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    <circle cx="12" cy="19" r="1.4" fill="currentColor" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Default() {
  return (
    <div style={stage}>
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              aria-label="Reservation actions"
            >
              <MoreIcon />
            </Button>
          }
        />
        <DropdownMenuContent style={menuWidth}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Reservation 4821</DropdownMenuLabel>
            <DropdownMenuItem>
              Open details
              <DropdownMenuShortcut>⏎</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Check in guest
              <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>Send confirmation email</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            Cancel reservation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function CheckboxItems() {
  return (
    <div style={stage}>
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger
          render={
            <Button variant="outline">
              Columns
              <ChevronDownIcon />
            </Button>
          }
        />
        <DropdownMenuContent style={menuWidth}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked>Guest</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>Room</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>Arrival</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={false}>
              Rate plan
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={false}>
              Balance
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function RadioItems() {
  return (
    <div style={stage}>
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger
          render={
            <Button variant="outline">
              Sort arrivals
              <ChevronDownIcon />
            </Button>
          }
        />
        <DropdownMenuContent style={menuWidth}>
          <DropdownMenuRadioGroup defaultValue="eta">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuRadioItem value="eta">
              Estimated arrival
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="guest">
              Guest name
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="room">
              Room number
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="balance">
              Outstanding balance
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function WithSubmenu() {
  return (
    <div style={stage}>
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger
          render={
            <Button variant="outline">
              Housekeeping
              <ChevronDownIcon />
            </Button>
          }
        />
        <DropdownMenuContent style={menuWidth}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Room 214</DropdownMenuLabel>
            <DropdownMenuItem>Mark as cleaned</DropdownMenuItem>
            <DropdownMenuItem>Request inspection</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSub defaultOpen>
            <DropdownMenuSubTrigger>Assign to attendant</DropdownMenuSubTrigger>
            <DropdownMenuSubContent style={{ width: 176 }}>
              <DropdownMenuItem>Maria Fischer</DropdownMenuItem>
              <DropdownMenuItem>Tomasz Nowak</DropdownMenuItem>
              <DropdownMenuItem>Elif Demir</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            Block for maintenance
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
