import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from 'tanstack-dashboard-ui';

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'flex-start',
  flexWrap: 'wrap'
} as const;

const field = { display: 'flex', flexDirection: 'column', gap: 6 } as const;

const caption = {
  fontSize: 12,
  color: 'var(--color-muted-foreground, #6b7280)'
} as const;

const triggerWidth = { width: 240 } as const;

const ratePlans = [
  { value: 'flex', label: 'Flexible rate' },
  { value: 'advance', label: 'Advance purchase' },
  { value: 'corporate', label: 'Corporate negotiated' },
  { value: 'bnb', label: 'Bed & breakfast' }
];

export function Default() {
  return (
    <Select items={ratePlans}>
      <SelectTrigger style={triggerWidth}>
        <SelectValue placeholder="Select a rate plan" />
      </SelectTrigger>
      <SelectContent>
        {ratePlans.map((plan) => (
          <SelectItem key={plan.value} value={plan.value}>
            {plan.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Selected() {
  return (
    <Select items={ratePlans} defaultValue="advance">
      <SelectTrigger style={triggerWidth}>
        <SelectValue placeholder="Select a rate plan" />
      </SelectTrigger>
      <SelectContent>
        {ratePlans.map((plan) => (
          <SelectItem key={plan.value} value={plan.value}>
            {plan.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Sizes() {
  return (
    <div style={row}>
      <div style={field}>
        <span style={caption}>size="sm"</span>
        <Select items={ratePlans} defaultValue="bnb">
          <SelectTrigger size="sm" style={triggerWidth}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ratePlans.map((plan) => (
              <SelectItem key={plan.value} value={plan.value}>
                {plan.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div style={field}>
        <span style={caption}>size="default"</span>
        <Select items={ratePlans} defaultValue="bnb">
          <SelectTrigger style={triggerWidth}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ratePlans.map((plan) => (
              <SelectItem key={plan.value} value={plan.value}>
                {plan.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function States() {
  return (
    <div style={row}>
      <div style={field}>
        <span style={caption}>disabled</span>
        <Select items={ratePlans} defaultValue="corporate" disabled>
          <SelectTrigger style={triggerWidth}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ratePlans.map((plan) => (
              <SelectItem key={plan.value} value={plan.value}>
                {plan.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div style={field}>
        <span style={caption}>aria-invalid</span>
        <Select items={ratePlans}>
          <SelectTrigger aria-invalid style={triggerWidth}>
            <SelectValue placeholder="Select a rate plan" />
          </SelectTrigger>
          <SelectContent>
            {ratePlans.map((plan) => (
              <SelectItem key={plan.value} value={plan.value}>
                {plan.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

const roomTypes = {
  sgl: 'Single, city view',
  'dbl-sea': 'Double, sea view',
  twin: 'Twin, courtyard',
  junior: 'Junior suite',
  terrace: 'Terrace suite',
  accessible: 'Accessible double'
};

export function OpenWithGroups() {
  return (
    <Select items={roomTypes} defaultValue="dbl-sea" defaultOpen>
      <SelectTrigger style={triggerWidth}>
        <SelectValue placeholder="Select a room type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Main building</SelectLabel>
          <SelectItem value="sgl">Single, city view</SelectItem>
          <SelectItem value="dbl-sea">Double, sea view</SelectItem>
          <SelectItem value="twin">Twin, courtyard</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Garden wing</SelectLabel>
          <SelectItem value="junior">Junior suite</SelectItem>
          <SelectItem value="terrace">Terrace suite</SelectItem>
          <SelectItem value="accessible" disabled>
            Accessible double (out of order)
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
