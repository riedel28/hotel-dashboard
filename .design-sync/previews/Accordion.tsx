import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge
} from 'tanstack-dashboard-ui';

const panel = { maxWidth: 560 } as const;

export function HousePolicies() {
  return (
    <Accordion defaultValue={['cancellation']} style={panel}>
      <AccordionItem value="cancellation">
        <AccordionTrigger>Cancellation policy</AccordionTrigger>
        <AccordionContent>
          <p>
            Free cancellation until 18:00 local time on the day before arrival.
            After that the first night is charged to the card on file.
          </p>
          <p>
            Non-refundable rates are charged in full at booking and cannot be
            moved to another date.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="check-in">
        <AccordionTrigger>Check-in and check-out</AccordionTrigger>
        <AccordionContent>
          <p>Check-in from 15:00, check-out until 11:00.</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="pets">
        <AccordionTrigger>Pets and extra beds</AccordionTrigger>
        <AccordionContent>
          <p>One dog per room, EUR 25 per night. Extra beds on request.</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function MultipleOpen() {
  return (
    <Accordion
      multiple
      defaultValue={['payment', 'housekeeping']}
      style={panel}
    >
      <AccordionItem value="payment">
        <AccordionTrigger>Payment</AccordionTrigger>
        <AccordionContent>
          <p>
            Visa ending 4417 pre-authorised for EUR 640.00. The balance is
            settled at check-out unless the company account is used.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="housekeeping">
        <AccordionTrigger>Housekeeping</AccordionTrigger>
        <AccordionContent>
          <p>
            Daily turndown, no linen change before the third night. The guest
            asked for hypoallergenic pillows.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="transfers">
        <AccordionTrigger>Airport transfers</AccordionTrigger>
        <AccordionContent>
          <p>No transfer booked for this stay.</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function WithTriggerBadge() {
  return (
    <Accordion defaultValue={['requests']} style={panel}>
      <AccordionItem value="requests">
        <AccordionTrigger>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            Open guest requests
            <Badge variant="secondary">3</Badge>
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <p>
            Room 412 — late check-out until 14:00, awaiting front-office
            approval.
          </p>
          <p>Room 118 — crib requested for the second night.</p>
          <p>
            Room 507 — quiet floor, guest asked to be moved away from the lift.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="closed">
        <AccordionTrigger>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Resolved this week
            <Badge variant="outline">12</Badge>
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <p>All requests logged before Monday have been closed.</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
