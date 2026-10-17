import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  AlertTriangleIcon,
  ArrowUpRightIcon,
  CircleHelpIcon
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { SecretField, TextField } from '@/components/provider-setup/fields';
import { ProviderFormCard } from '@/components/provider-setup/provider-form-card';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

import { SALTO_TEST_STEPS } from './salto-test-steps';

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

// The interface in use decides which of these the schema asks for.
const MESSAGES = {
  host: msg`Host is required`,
  port: msg`Enter a valid port number`,
  shipUrl: msg`SHIP-URL is required`,
  username: msg`Username is required`
};

const SHIP_TYPES = [
  { value: 'https', label: 'HTTPS' },
  { value: 'stp', label: 'STP' }
] as const;

/** A help mark beside an interface's name: what it is for, on hover. */
function InterfaceHint({ children }: { children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span className="inline-flex text-muted-foreground" />}
      >
        <CircleHelpIcon className="size-3.5" aria-hidden="true" />
      </TooltipTrigger>
      {/* A few short lines: wide enough not to be a column, narrow enough to read */}
      <TooltipContent className="max-w-64 py-2 leading-relaxed text-pretty">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

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
    messages: MESSAGES,
    secretRequired: msg`Password is required`,
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
      providerForm={providerForm}
      entry={entry}
      onChooseProvider={onChooseProvider}
      testSteps={
        mode === 'pms' ? SALTO_TEST_STEPS.pms : SALTO_TEST_STEPS[shipType]
      }
    >
      <Controller
        control={form.control}
        name="mode"
        render={({ field }) => (
          <Tabs value={field.value} onValueChange={field.onChange}>
            <TabsList className="h-9! w-full">
              <TabsTrigger value="pms" className="flex-1">
                <Trans>PMS interface</Trans>
                <InterfaceHint>
                  <Trans>
                    Choose this if guests open doors over Bluetooth with the
                    mobile app (Android and iOS), or if key cards are encoded at
                    a check-in station.
                  </Trans>
                </InterfaceHint>
              </TabsTrigger>
              <TabsTrigger value="ship" className="flex-1">
                <Trans>SHIP interface</Trans>
                <InterfaceHint>
                  <Trans>
                    Choose this if your SALTO installation is integrated through
                    SHIP, its host interface protocol. The connection signs in
                    with a user name and password. If you are unsure which
                    interface is set up, ask your SALTO partner.
                  </Trans>
                </InterfaceHint>
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
                    className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
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
