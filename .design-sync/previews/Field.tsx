import {
  Checkbox,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  Input,
  Switch,
  Textarea
} from 'tanstack-dashboard-ui';

const sheet = { maxWidth: 480 } as const;
const caption = {
  fontSize: 12,
  color: 'var(--color-muted-foreground)',
  marginBottom: 6
} as const;

export function Default() {
  return (
    <div style={sheet}>
      <Field>
        <FieldLabel htmlFor="field-guest-email">Guest email</FieldLabel>
        <Input
          id="field-guest-email"
          type="email"
          defaultValue="a.hartwig@nordsee-resort.de"
        />
        <FieldDescription>
          The confirmation and the digital key link are both sent here.
        </FieldDescription>
      </Field>
    </div>
  );
}

export function Orientations() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        maxWidth: 480
      }}
    >
      <div>
        <p style={caption}>orientation="vertical"</p>
        <FieldGroup>
          <Field orientation="vertical">
            <FieldLabel htmlFor="field-room">Room</FieldLabel>
            <Input id="field-room" defaultValue="214" />
            <FieldDescription>Label sits above the control.</FieldDescription>
          </Field>
        </FieldGroup>
      </div>
      <div>
        <p style={caption}>orientation="horizontal"</p>
        <FieldGroup>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="field-late-checkout">
                Late checkout
              </FieldLabel>
              <FieldDescription>
                Release room 214 at 14:00 instead of 11:00.
              </FieldDescription>
            </FieldContent>
            <Switch id="field-late-checkout" defaultChecked />
          </Field>
        </FieldGroup>
      </div>
      <div>
        <p style={caption}>
          orientation="responsive" — inline above the field-group breakpoint
        </p>
        <FieldGroup>
          <Field orientation="responsive">
            <FieldLabel htmlFor="field-adults-responsive">Adults</FieldLabel>
            <Input
              id="field-adults-responsive"
              type="number"
              defaultValue={2}
            />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="field-nights-responsive">Nights</FieldLabel>
            <Input
              id="field-nights-responsive"
              type="number"
              defaultValue={3}
            />
          </Field>
        </FieldGroup>
      </div>
    </div>
  );
}

export function WithError() {
  return (
    <FieldGroup style={sheet}>
      <Field>
        <FieldLabel htmlFor="field-departure">Departure date</FieldLabel>
        <Input
          id="field-departure"
          type="date"
          defaultValue="2026-08-11"
          aria-invalid
        />
        <FieldError>
          Departure must be after the arrival date (14 August 2026).
        </FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="field-adults">Adults</FieldLabel>
        <Input id="field-adults" type="number" defaultValue={9} aria-invalid />
        <FieldError
          errors={[
            { message: 'Deluxe Sea View sleeps a maximum of 4 guests.' },
            { message: 'Extra beds must be booked as a separate service.' }
          ]}
        />
      </Field>
    </FieldGroup>
  );
}

export function FieldSetWithLegend() {
  return (
    <FieldSet style={sheet}>
      <FieldLegend>Housekeeping preferences</FieldLegend>
      <FieldDescription>
        Applied to every night of reservation RSV-40182.
      </FieldDescription>
      <FieldGroup>
        <Field orientation="horizontal">
          <Checkbox id="field-turndown" defaultChecked />
          <FieldLabel htmlFor="field-turndown">
            Evening turndown service
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="field-linen" />
          <FieldLabel htmlFor="field-linen">Daily linen change</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="field-minibar" defaultChecked />
          <FieldLabel htmlFor="field-minibar">Restock the minibar</FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

export function Disabled() {
  return (
    <FieldGroup style={sheet}>
      <Field data-disabled="true">
        <FieldLabel htmlFor="field-folio">Folio total</FieldLabel>
        <Input id="field-folio" defaultValue="€ 1,284.00" disabled />
        <FieldDescription>
          The folio is closed and can no longer be edited.
        </FieldDescription>
      </Field>
      <FieldSeparator>Internal</FieldSeparator>
      <Field>
        <FieldLabel htmlFor="field-internal-note">Internal note</FieldLabel>
        <Textarea
          id="field-internal-note"
          placeholder="Not visible to the guest"
        />
      </Field>
    </FieldGroup>
  );
}
