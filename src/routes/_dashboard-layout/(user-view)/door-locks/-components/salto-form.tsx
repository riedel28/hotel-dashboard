import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { AlertTriangleIcon, ArrowUpRightIcon } from 'lucide-react';
import { Controller, useWatch } from 'react-hook-form';
import { isPortNumber } from 'shared/types/providers';
import type { z } from 'zod';

import { SecretField, TextField } from '@/components/provider-setup/fields';
import { ProviderFormCard } from '@/components/provider-setup/provider-form-card';
import type { TestConnectionStep } from '@/components/provider-setup/test-connection-dialog';
import type { ProviderFormProps } from '@/components/provider-setup/types';
import {
  type ProviderFormValues,
  useProviderForm
} from '@/components/provider-setup/use-provider-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Field, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SaltoFormData = ProviderFormValues<'door_lock', 'salto'>;

const EMPTY_VALUES: SaltoFormData = {
  mode: 'pms',
  host: '',
  port: '',
  shipType: 'https',
  shipUrl: '',
  username: '',
  secret: ''
};

// Which fields must be filled in depends on the interface: see `refine`.
const REQUIRED = {};

// Mirrors saltoConfigSchema, in the UI language. The password is the form's
// secret, which the form hook asks for by itself over SHIP.
function refine(
  data: SaltoFormData,
  ctx: z.RefinementCtx,
  t: (message: MessageDescriptor) => string
) {
  const issue = (field: keyof SaltoFormData, message: MessageDescriptor) =>
    ctx.addIssue({ code: 'custom', path: [field], message: t(message) });

  if (data.mode === 'pms') {
    if (!data.host.trim()) issue('host', msg`Host is required`);
    if (!data.port.trim()) issue('port', msg`Port is required`);
    else if (!isPortNumber(data.port.trim())) {
      issue('port', msg`Enter a valid port number`);
    }
    return;
  }

  if (data.shipType === 'https' && !data.shipUrl.trim()) {
    issue('shipUrl', msg`SHIP-URL is required`);
  }
  if (!data.username.trim()) issue('username', msg`Username is required`);
}

const TCP: TestConnectionStep = {
  id: 'tcp',
  name: msg`TCP connection`,
  error: msg`Connection timed out after 5000 ms — host unreachable.`
};
const AUTH: TestConnectionStep = {
  id: 'auth',
  name: msg`Authentication`,
  error: msg`401 Unauthorized — check username and password.`
};
const SHIP: TestConnectionStep = {
  id: 'ship',
  name: msg`SHIP handshake`,
  error: msg`SHIP handshake rejected: unsupported protocol version.`
};

// What a connection test checks, by how the locks are reached.
const TEST_STEPS = {
  pms: [
    TCP,
    {
      id: 'handshake',
      name: msg`PMS interface handshake`,
      error: msg`No response from the PMS interface.`
    }
  ],
  stp: [TCP, AUTH, SHIP],
  https: [
    TCP,
    {
      id: 'tls',
      name: msg`TLS certificate`,
      error: msg`TLS handshake failed: certificate is self-signed or expired.`
    },
    AUTH,
    SHIP
  ]
} satisfies Record<string, TestConnectionStep[]>;

const SHIP_TYPES = [
  { value: 'https', label: 'HTTPS' },
  { value: 'stp', label: 'STP' }
] as const;

export function SaltoForm({
  entry,
  saved,
  replaces,
  onChooseProvider
}: ProviderFormProps<'door_lock'>) {
  const providerForm = useProviderForm({
    kind: 'door_lock',
    provider: 'salto',
    name: entry.name,
    saved,
    emptyValues: EMPTY_VALUES,
    required: REQUIRED,
    secretRequired: msg`Password is required`,
    refine,
    replaces
  });
  const { form } = providerForm;
  const { errors } = form.formState;
  const [mode, shipType] = useWatch({
    control: form.control,
    name: ['mode', 'shipType']
  });

  return (
    <ProviderFormCard
      {...providerForm}
      entry={entry}
      onChooseProvider={onChooseProvider}
      testSteps={mode === 'pms' ? TEST_STEPS.pms : TEST_STEPS[shipType]}
    >
      <Controller
        control={form.control}
        name="mode"
        render={({ field }) => (
          <Tabs value={field.value} onValueChange={field.onChange}>
            <TabsList className="h-9! w-full">
              <TabsTrigger value="pms" className="flex-1 text-foreground/70!">
                <Trans>PMS interface</Trans>
              </TabsTrigger>
              <TabsTrigger value="ship" className="flex-1 text-foreground/70!">
                <Trans>SHIP interface</Trans>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      />

      {mode === 'pms' ? (
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-8">
            <TextField
              label={<Trans>Host</Trans>}
              error={errors.host}
              {...form.register('host')}
            />
          </div>
          <div className="col-span-4">
            <TextField
              label={<Trans>Port</Trans>}
              error={errors.port}
              {...form.register('port')}
            />
          </div>
        </div>
      ) : (
        <>
          <Controller
            control={form.control}
            name="shipType"
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  <Trans>SHIP-Type</Trans>
                </FieldLabel>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-2 gap-2"
                >
                  {SHIP_TYPES.map(({ value, label }) => (
                    <Label
                      key={value}
                      htmlFor={`ship-type-${value}`}
                      className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted dark:bg-input/30"
                    >
                      <RadioGroupItem value={value} id={`ship-type-${value}`} />
                      {label}
                    </Label>
                  ))}
                </RadioGroup>
              </Field>
            )}
          />

          {shipType === 'stp' && (
            <Alert variant="warning">
              <AlertTriangleIcon />
              <AlertTitle>
                <Trans>STP is deprecated</Trans>
              </AlertTitle>
              <AlertDescription>
                <Trans>
                  This connection method is outdated and will stop being
                  supported in a future release.{' '}
                  <a
                    href="https://docs.saltosystems.com/ship-https-migration"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
                  >
                    View the migration guide
                    <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
                  </a>
                </Trans>
              </AlertDescription>
            </Alert>
          )}

          {shipType === 'https' && (
            <TextField
              label={<Trans>SHIP-URL</Trans>}
              error={errors.shipUrl}
              {...form.register('shipUrl')}
            />
          )}
          <TextField
            label={<Trans>Username</Trans>}
            error={errors.username}
            {...form.register('username')}
          />
          <SecretField
            label={<Trans>Password</Trans>}
            error={errors.secret}
            stored={providerForm.secretStored}
            {...form.register('secret')}
          />
        </>
      )}
    </ProviderFormCard>
  );
}
