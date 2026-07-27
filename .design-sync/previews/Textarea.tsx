import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Textarea
} from 'tanstack-dashboard-ui';

const stack = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  maxWidth: 440
} as const;
const caption = {
  fontSize: 12,
  color: 'var(--color-muted-foreground)'
} as const;

export function Default() {
  return (
    <div style={{ maxWidth: 440 }}>
      <Textarea placeholder="Add a note for the arrival team…" />
    </div>
  );
}

export function Filled() {
  return (
    <div style={{ maxWidth: 440 }}>
      <Textarea
        rows={4}
        defaultValue={
          'Honeymoon stay — 3 nights in 214 (Deluxe Sea View).\nSparkling wine and a handwritten card on arrival.\nGuest asked for a high floor away from the lift.'
        }
      />
    </div>
  );
}

export function States() {
  return (
    <div style={stack}>
      <div>
        <Textarea
          defaultValue="Allergy: shellfish. Flag to the restaurant before dinner service."
          readOnly
        />
        <p style={caption}>Read-only</p>
      </div>
      <div>
        <Textarea
          defaultValue="Cancellation reason is locked once the folio is closed."
          disabled
        />
        <p style={caption}>Disabled</p>
      </div>
    </div>
  );
}

export function InField() {
  return (
    <div style={stack}>
      <Field>
        <FieldLabel htmlFor="arrival-note">Arrival note</FieldLabel>
        <Textarea
          id="arrival-note"
          defaultValue="Late arrival, ETA 23:40. Night porter to hold the key card at reception."
        />
        <FieldDescription>
          Visible to reception and housekeeping on the arrivals list.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="cancellation-reason">
          Cancellation reason
        </FieldLabel>
        <Textarea
          id="cancellation-reason"
          aria-invalid
          placeholder="Why is RSV-40182 being cancelled?"
        />
        <FieldError>
          A reason is required before a booking can be cancelled.
        </FieldError>
      </Field>
    </div>
  );
}
