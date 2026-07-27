import {
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from 'tanstack-dashboard-ui';

const panel = {
  paddingTop: 12,
  fontSize: 14,
  lineHeight: 1.5,
  maxWidth: 520
} as const;

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  padding: '6px 0'
} as const;

export function Default() {
  return (
    <Tabs defaultValue="stay" style={{ width: 520 }}>
      <TabsList>
        <TabsTrigger value="stay">Stay</TabsTrigger>
        <TabsTrigger value="guest">Guest</TabsTrigger>
        <TabsTrigger value="folio">Folio</TabsTrigger>
      </TabsList>
      <TabsContent value="stay" style={panel}>
        <div style={row}>
          <span>Room 214 · Deluxe double, sea view</span>
          <span>3 nights</span>
        </div>
        <div style={row}>
          <span>Arrival</span>
          <span>Fri 14 Aug, after 15:00</span>
        </div>
        <div style={row}>
          <span>Departure</span>
          <span>Mon 17 Aug, before 11:00</span>
        </div>
      </TabsContent>
      <TabsContent value="guest" style={panel}>
        Anna Krüger · anna.krueger@example.de · +49 30 5550 118. Repeat guest,
        eighth stay this year.
      </TabsContent>
      <TabsContent value="folio" style={panel}>
        Balance €642.00 across four postings. Card ending 4417 is authorised for
        the full amount.
      </TabsContent>
    </Tabs>
  );
}

export function LineVariant() {
  return (
    <Tabs defaultValue="arrivals" style={{ width: 520 }}>
      <TabsList variant="line">
        <TabsTrigger value="arrivals">Arrivals</TabsTrigger>
        <TabsTrigger value="departures">Departures</TabsTrigger>
        <TabsTrigger value="in-house">In house</TabsTrigger>
      </TabsList>
      <TabsContent value="arrivals" style={panel}>
        <div style={row}>
          <span>14:00 · Room 214 · A. Krüger</span>
          <Badge color="emerald" size="sm">
            Ready
          </Badge>
        </div>
        <div style={row}>
          <span>16:30 · Room 302 · M. Sørensen</span>
          <Badge color="orange" size="sm">
            Cleaning
          </Badge>
        </div>
        <div style={row}>
          <span>19:00 · Room 118 · T. Okafor</span>
          <Badge color="emerald" size="sm">
            Ready
          </Badge>
        </div>
      </TabsContent>
      <TabsContent value="departures" style={panel}>
        Nine departures before 11:00. Two guests have asked for a late checkout
        and are waiting on approval.
      </TabsContent>
      <TabsContent value="in-house" style={panel}>
        62 of 84 rooms occupied. Housekeeping has cleared floors 2 and 3.
      </TabsContent>
    </Tabs>
  );
}

export function Vertical() {
  return (
    <Tabs defaultValue="rates" orientation="vertical" style={{ width: 520 }}>
      <TabsList style={{ minWidth: 140 }}>
        <TabsTrigger value="rates">Rate plans</TabsTrigger>
        <TabsTrigger value="taxes">Taxes</TabsTrigger>
        <TabsTrigger value="policies">Policies</TabsTrigger>
      </TabsList>
      <TabsContent value="rates" style={{ ...panel, paddingTop: 0 }}>
        Summer flexible, Summer non-refundable and Corporate BAR are active for
        the Hamburg property.
      </TabsContent>
      <TabsContent value="taxes" style={{ ...panel, paddingTop: 0 }}>
        19% VAT on accommodation, 7% on food and beverage. City tax is charged
        per person per night.
      </TabsContent>
      <TabsContent value="policies" style={{ ...panel, paddingTop: 0 }}>
        Free cancellation until 18:00 on the day of arrival. No-shows are
        charged the first night.
      </TabsContent>
    </Tabs>
  );
}
