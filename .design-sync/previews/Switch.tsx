import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Switch
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
      <FieldContent>
        <FieldLabel htmlFor="switch-online">Sell this room online</FieldLabel>
        <FieldDescription>
          Deluxe Sea View 214 stays bookable on the channel manager.
        </FieldDescription>
      </FieldContent>
      <Switch id="switch-online" defaultChecked />
    </Field>
  );
}

export function Sizes() {
  return (
    <div style={row}>
      <div style={cell}>
        <Switch defaultChecked />
        <span style={caption}>default — on</span>
      </div>
      <div style={cell}>
        <Switch />
        <span style={caption}>default — off</span>
      </div>
      <div style={cell}>
        <Switch size="sm" defaultChecked />
        <span style={caption}>sm — on</span>
      </div>
      <div style={cell}>
        <Switch size="sm" />
        <span style={caption}>sm — off</span>
      </div>
    </div>
  );
}

export function States() {
  return (
    <div style={row}>
      <div style={cell}>
        <Switch defaultChecked disabled />
        <span style={caption}>On + disabled</span>
      </div>
      <div style={cell}>
        <Switch disabled />
        <span style={caption}>Off + disabled</span>
      </div>
      <div style={cell}>
        <Switch readOnly defaultChecked />
        <span style={caption}>Read-only</span>
      </div>
      <div style={cell}>
        <Switch aria-invalid />
        <span style={caption}>Invalid</span>
      </div>
    </div>
  );
}

export function SettingsList() {
  return (
    <FieldSet style={sheet}>
      <FieldLegend variant="label">Front-desk notifications</FieldLegend>
      <FieldGroup>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="switch-arrivals">New arrivals</FieldLabel>
            <FieldDescription>
              Ping the desk when a guest checks in from the kiosk.
            </FieldDescription>
          </FieldContent>
          <Switch id="switch-arrivals" defaultChecked />
        </Field>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="switch-payments">
              Failed card authorisations
            </FieldLabel>
            <FieldDescription>
              Alert when a pre-authorisation on a folio is declined.
            </FieldDescription>
          </FieldContent>
          <Switch id="switch-payments" defaultChecked />
        </Field>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="switch-audit">Night audit summary</FieldLabel>
            <FieldDescription>
              Emailed at 03:30 once the audit completes.
            </FieldDescription>
          </FieldContent>
          <Switch id="switch-audit" />
        </Field>
        <Field orientation="horizontal" data-disabled="true">
          <FieldContent>
            <FieldLabel htmlFor="switch-sms">SMS to on-call manager</FieldLabel>
            <FieldDescription>
              Add a mobile number to the property to enable this.
            </FieldDescription>
          </FieldContent>
          <Switch id="switch-sms" disabled />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
