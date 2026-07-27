import {
  Checkbox,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet
} from 'tanstack-dashboard-ui';

const sheet = { maxWidth: 460 } as const;
const row = {
  display: 'flex',
  gap: 24,
  alignItems: 'center',
  flexWrap: 'wrap'
} as const;
const cell = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  alignItems: 'center'
} as const;
const caption = {
  fontSize: 12,
  color: 'var(--color-muted-foreground)'
} as const;

export function Default() {
  return (
    <Field orientation="horizontal" style={sheet}>
      <Checkbox id="checkbox-breakfast" defaultChecked />
      <FieldLabel htmlFor="checkbox-breakfast">
        Include breakfast (€ 24 per guest)
      </FieldLabel>
    </Field>
  );
}

export function States() {
  return (
    <div style={row}>
      <div style={cell}>
        <Checkbox />
        <span style={caption}>Unchecked</span>
      </div>
      <div style={cell}>
        <Checkbox defaultChecked />
        <span style={caption}>Checked</span>
      </div>
      <div style={cell}>
        <Checkbox disabled />
        <span style={caption}>Disabled</span>
      </div>
      <div style={cell}>
        <Checkbox defaultChecked disabled />
        <span style={caption}>Checked + disabled</span>
      </div>
      <div style={cell}>
        <Checkbox aria-invalid />
        <span style={caption}>Invalid</span>
      </div>
    </div>
  );
}

export function AmenityList() {
  return (
    <FieldSet style={sheet}>
      <FieldLegend variant="label">Add-ons for room 214</FieldLegend>
      <FieldGroup>
        <Field orientation="horizontal">
          <Checkbox id="checkbox-airport" defaultChecked />
          <FieldContent>
            <FieldLabel htmlFor="checkbox-airport">Airport transfer</FieldLabel>
            <FieldDescription>
              Sedan from Hamburg Airport, € 85 each way.
            </FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="checkbox-spa" />
          <FieldContent>
            <FieldLabel htmlFor="checkbox-spa">Spa access</FieldLabel>
            <FieldDescription>
              Pool and sauna, € 30 per guest per day.
            </FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="checkbox-parking" defaultChecked />
          <FieldContent>
            <FieldLabel htmlFor="checkbox-parking">
              Underground parking
            </FieldLabel>
            <FieldDescription>
              One bay per room, € 18 per night.
            </FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation="horizontal" data-disabled="true">
          <Checkbox id="checkbox-crib" disabled />
          <FieldContent>
            <FieldLabel htmlFor="checkbox-crib">Travel cot</FieldLabel>
            <FieldDescription>
              Unavailable — all cots are allocated for these dates.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

export function Invalid() {
  return (
    <Field style={sheet}>
      <Field orientation="horizontal">
        <Checkbox id="checkbox-terms" aria-invalid />
        <FieldLabel htmlFor="checkbox-terms">
          I confirm the guest accepted the cancellation policy
        </FieldLabel>
      </Field>
      <FieldError>Confirm the policy before taking the deposit.</FieldError>
    </Field>
  );
}
