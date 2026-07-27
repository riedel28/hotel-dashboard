import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  RadioGroup,
  RadioGroupItem
} from 'tanstack-dashboard-ui';

const sheet = { maxWidth: 480 } as const;

export function Default() {
  return (
    <FieldSet style={sheet}>
      <FieldLegend variant="label">Rate plan</FieldLegend>
      <RadioGroup defaultValue="flexible" name="rate-plan">
        <Field orientation="horizontal">
          <RadioGroupItem id="rate-flexible" value="flexible" />
          <FieldLabel htmlFor="rate-flexible">
            Flexible — free cancellation
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="rate-advance" value="advance" />
          <FieldLabel htmlFor="rate-advance">
            Advance purchase — 15% off
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="rate-corporate" value="corporate" />
          <FieldLabel htmlFor="rate-corporate">
            Corporate — Nordwind AG
          </FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  );
}

export function WithDescriptions() {
  return (
    <FieldSet style={sheet}>
      <FieldLegend>Room assignment for RSV-40182</FieldLegend>
      <FieldDescription>
        Three sea-view rooms are free for 14–17 August.
      </FieldDescription>
      <RadioGroup defaultValue="214" name="room-assignment">
        <Field orientation="horizontal">
          <RadioGroupItem id="room-214" value="214" />
          <FieldContent>
            <FieldLabel htmlFor="room-214">
              Room 214 — Deluxe Sea View
            </FieldLabel>
            <FieldDescription>
              Second floor, king bed, balcony. € 320 per night.
            </FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="room-317" value="317" />
          <FieldContent>
            <FieldLabel htmlFor="room-317">Room 317 — Junior Suite</FieldLabel>
            <FieldDescription>
              Third floor, separate lounge. € 410 per night.
            </FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="room-402" value="402" />
          <FieldContent>
            <FieldLabel htmlFor="room-402">
              Room 402 — Panorama Suite
            </FieldLabel>
            <FieldDescription>
              Top floor, terrace and sauna. € 560 per night.
            </FieldDescription>
          </FieldContent>
        </Field>
      </RadioGroup>
    </FieldSet>
  );
}

export function Disabled() {
  return (
    <FieldSet style={sheet}>
      <FieldLegend variant="label">Deposit method</FieldLegend>
      <FieldDescription>
        Locked — the deposit was already captured on 2 July 2026.
      </FieldDescription>
      <RadioGroup defaultValue="card" name="deposit-method" disabled>
        <Field orientation="horizontal" data-disabled="true">
          <RadioGroupItem id="deposit-card" value="card" />
          <FieldLabel htmlFor="deposit-card">
            Card on file — Visa ending 4417
          </FieldLabel>
        </Field>
        <Field orientation="horizontal" data-disabled="true">
          <RadioGroupItem id="deposit-transfer" value="transfer" />
          <FieldLabel htmlFor="deposit-transfer">Bank transfer</FieldLabel>
        </Field>
        <Field orientation="horizontal" data-disabled="true">
          <RadioGroupItem id="deposit-invoice" value="invoice" />
          <FieldLabel htmlFor="deposit-invoice">
            Invoice to company account
          </FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  );
}

export function Invalid() {
  return (
    <FieldSet style={sheet}>
      <FieldLegend variant="label">Reason for the room move</FieldLegend>
      <RadioGroup name="move-reason">
        <Field orientation="horizontal">
          <RadioGroupItem
            id="move-maintenance"
            value="maintenance"
            aria-invalid
          />
          <FieldLabel htmlFor="move-maintenance">Maintenance issue</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="move-upgrade" value="upgrade" aria-invalid />
          <FieldLabel htmlFor="move-upgrade">Complimentary upgrade</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="move-request" value="request" aria-invalid />
          <FieldLabel htmlFor="move-request">Guest request</FieldLabel>
        </Field>
      </RadioGroup>
      <FieldError>
        Pick a reason — it is written to the room-move audit log.
      </FieldError>
    </FieldSet>
  );
}
