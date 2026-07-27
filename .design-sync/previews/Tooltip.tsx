import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from 'tanstack-dashboard-ui';

const stage = {
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 56,
  paddingBottom: 56
} as const;

const column = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 72,
  paddingTop: 48,
  paddingBottom: 48
} as const;

const BedIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path d="M2 18V7M2 12h20v6" strokeLinecap="round" />
    <path d="M6 12V9h5v3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 18v-3" strokeLinecap="round" />
  </svg>
);

const KeyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="M10.7 12.3 21 2M17 6l3 3" strokeLinecap="round" />
  </svg>
);

export function Default() {
  return (
    <div style={stage}>
      <Tooltip defaultOpen>
        <TooltipTrigger
          render={
            <Button variant="outline" size="icon" aria-label="Mark room clean">
              <BedIcon />
            </Button>
          }
        />
        <TooltipContent>Mark room 214 as cleaned</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function Sides() {
  return (
    <div style={column}>
      <Tooltip defaultOpen>
        <TooltipTrigger render={<Button variant="outline">Above</Button>} />
        <TooltipContent side="top">Arrivals due today</TooltipContent>
      </Tooltip>
      <Tooltip defaultOpen>
        <TooltipTrigger render={<Button variant="outline">Beside</Button>} />
        <TooltipContent side="right">
          Departures not yet checked out
        </TooltipContent>
      </Tooltip>
      <Tooltip defaultOpen>
        <TooltipTrigger render={<Button variant="outline">Below</Button>} />
        <TooltipContent side="bottom">
          Rooms blocked for maintenance
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export function LongContent() {
  return (
    <div style={stage}>
      <Tooltip defaultOpen>
        <TooltipTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Key card policy">
              <KeyIcon />
            </Button>
          }
        />
        <TooltipContent side="bottom">
          Key cards expire at 11:00 on the departure date. Extend the stay
          first, otherwise the guest is locked out of the room and the lift.
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export function SharedProvider() {
  return (
    <TooltipProvider delay={0}>
      <div style={{ ...column, gap: 64 }}>
        <Tooltip defaultOpen>
          <TooltipTrigger
            render={
              <Button variant="secondary" size="icon-sm" aria-label="Occupancy">
                <span style={{ fontSize: 12, fontWeight: 600 }}>82</span>
              </Button>
            }
          />
          <TooltipContent side="right">82% occupancy tonight</TooltipContent>
        </Tooltip>
        <Tooltip defaultOpen>
          <TooltipTrigger
            render={
              <Button
                variant="secondary"
                size="icon-sm"
                aria-label="Average rate"
              >
                <span style={{ fontSize: 12, fontWeight: 600 }}>€</span>
              </Button>
            }
          />
          <TooltipContent side="right">Average daily rate €148</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
