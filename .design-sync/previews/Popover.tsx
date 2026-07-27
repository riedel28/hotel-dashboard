import {
  Button,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Switch
} from 'tanstack-dashboard-ui';

const stage = {
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 16,
  paddingBottom: 16
} as const;

const sideStage = {
  display: 'flex',
  justifyContent: 'flex-start',
  paddingTop: 16,
  paddingBottom: 16
} as const;

const line = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12
} as const;

export function Default() {
  return (
    <div style={stage}>
      <Popover defaultOpen>
        <PopoverTrigger
          render={<Button variant="outline">Rate details</Button>}
        />
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Summer flexible</PopoverTitle>
            <PopoverDescription>
              Free cancellation until 18:00 on the day of arrival. Breakfast is
              included for up to two adults.
            </PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function WithActions() {
  return (
    <div style={stage}>
      <Popover defaultOpen>
        <PopoverTrigger render={<Button>Early check-in</Button>} />
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Allow early check-in?</PopoverTitle>
            <PopoverDescription>
              Room 317 is clean and inspected. The guest can be checked in three
              hours before the standard 15:00 arrival time.
            </PopoverDescription>
          </PopoverHeader>
          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'flex-end',
              marginTop: 16
            }}
          >
            <Button variant="outline" size="sm">
              Not now
            </Button>
            <Button size="sm">Check in</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function SidePlacement() {
  return (
    <div style={sideStage}>
      <Popover defaultOpen>
        <PopoverTrigger
          render={<Button variant="secondary">Housekeeping settings</Button>}
        />
        <PopoverContent side="right" align="start">
          <PopoverHeader>
            <PopoverTitle>Daily service</PopoverTitle>
            <PopoverDescription>
              Applies to every occupied room on floors 1 to 4.
            </PopoverDescription>
          </PopoverHeader>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginTop: 16
            }}
          >
            <div style={line}>
              <span>Change linen daily</span>
              <Switch defaultChecked />
            </div>
            <div style={line}>
              <span>Restock minibar</span>
              <Switch />
            </div>
            <div style={line}>
              <span>Turndown service</span>
              <Switch defaultChecked />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
