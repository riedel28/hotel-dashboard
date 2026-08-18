import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  AlertTriangleIcon,
  ArrowUpRightIcon,
  CheckIcon,
  Loader2Icon,
  UnplugIcon,
  XIcon
} from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import {
  type TestConnectionConfig,
  TestConnectionDialog,
  type TestConnectionResult
} from './test-connection-dialog';

type IntegrationMode = 'pms' | 'ship';
type ShipType = 'stp' | 'https';

interface DoorLocksFormData {
  host: string;
  port: string;
  shipType: ShipType;
  shipUrl: string;
  username: string;
  password: string;
}

export function DoorLocksForm() {
  const { i18n } = useLingui();
  const [integrationMode, setIntegrationMode] =
    React.useState<IntegrationMode>('pms');
  const [testDialogOpen, setTestDialogOpen] = React.useState(false);
  const [testConfig, setTestConfig] =
    React.useState<TestConnectionConfig | null>(null);
  const [lastTestResult, setLastTestResult] =
    React.useState<TestConnectionResult | null>(null);

  const doorLocksFormSchema = z
    .object({
      host: z.string(),
      port: z.string(),
      shipType: z.enum(['stp', 'https']),
      shipUrl: z.string(),
      username: z.string(),
      password: z.string()
    })
    .superRefine((data, ctx) => {
      if (integrationMode === 'pms') {
        if (!data.host.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['host'],
            message: t`Host is required`
          });
        }
        if (!data.port.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['port'],
            message: t`Port is required`
          });
        } else if (
          !/^\d+$/.test(data.port) ||
          Number(data.port) < 1 ||
          Number(data.port) > 65535
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['port'],
            message: t`Enter a valid port number`
          });
        }
      }

      if (integrationMode === 'ship') {
        if (data.shipType === 'https' && !data.shipUrl.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['shipUrl'],
            message: t`SHIP-URL is required`
          });
        }
        if (!data.username.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['username'],
            message: t`Username is required`
          });
        }
        if (!data.password.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['password'],
            message: t`Password is required`
          });
        }
      }
    });

  const form = useForm<DoorLocksFormData>({
    resolver: zodResolver(doorLocksFormSchema),
    defaultValues: {
      host: '',
      port: '',
      shipType: 'https',
      shipUrl: '',
      username: '',
      password: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const shipType = form.watch('shipType');

  const onSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    toast.success(t`Config updated`);
  };

  const handleTestConnection = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    const values = form.getValues();
    setTestConfig({
      mode: integrationMode,
      shipType: values.shipType,
      host: values.host,
      port: values.port,
      shipUrl: values.shipUrl
    });
    setTestDialogOpen(true);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center-safe gap-2">
              <CardTitle>
                <Trans>SALTO</Trans>
              </CardTitle>
              <Badge
                variant="outline"
                size="sm"
                className="cursor-pointer rounded-md bg-accent text-[11px] text-accent-foreground"
                render={
                  <a
                    href="https:google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <Trans>Integration Guide</Trans>
                <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
              </Badge>
            </div>
          </div>
          <div className="flex h-9 w-20 shrink-0 items-center justify-end">
            <img
              src="/salto-logo.svg"
              alt="SALTO"
              className="max-h-9 max-w-full object-contain dark:hidden"
            />
            <img
              src="/salto-logo-inverse.svg"
              alt="SALTO"
              className="hidden max-h-9 max-w-full object-contain dark:block"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          id="door-locks-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <FieldGroup>
            <Tabs
              value={integrationMode}
              onValueChange={(value) =>
                setIntegrationMode(value as IntegrationMode)
              }
            >
              <TabsList className="h-9! w-full">
                <TabsTrigger value="pms" className="flex-1 text-foreground/70!">
                  <Trans>PMS-Schnittstelle</Trans>
                </TabsTrigger>
                <TabsTrigger
                  value="ship"
                  className="flex-1 text-foreground/70!"
                >
                  <Trans>SHIP-Schnittstelle</Trans>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {integrationMode === 'pms' && (
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-9">
                  <Controller
                    control={form.control}
                    name="host"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          <Trans>Host</Trans>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="192.168.1.10"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
                <div className="col-span-12 md:col-span-3">
                  <Controller
                    control={form.control}
                    name="port"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          <Trans>Port</Trans>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          {...field}
                          type="text"
                          inputMode="numeric"
                          aria-invalid={fieldState.invalid}
                          placeholder="13445"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>
            )}

            {integrationMode === 'ship' && (
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
                        <Label
                          htmlFor="ship-type-https"
                          className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted dark:bg-input/30"
                        >
                          <RadioGroupItem value="https" id="ship-type-https" />
                          HTTPS
                        </Label>
                        <Label
                          htmlFor="ship-type-stp"
                          className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted dark:bg-input/30"
                        >
                          <RadioGroupItem value="stp" id="ship-type-stp" />
                          STP
                        </Label>
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
                          <ArrowUpRightIcon
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        </a>
                      </Trans>
                    </AlertDescription>
                  </Alert>
                )}

                {shipType === 'https' && (
                  <Controller
                    control={form.control}
                    name="shipUrl"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          <Trans>SHIP-URL</Trans>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="https://192.168.1.10:13448"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                )}

                <Controller
                  control={form.control}
                  name="username"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Username</Trans>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="api-user"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        <Trans>Password</Trans>
                      </FieldLabel>
                      <PasswordInput
                        id={field.name}
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </>
            )}
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="-mb-6 flex-col items-stretch gap-3 py-4!">
        <div className="flex flex-wrap justify-end gap-2">
          {lastTestResult && (
            <p className="mr-auto flex shrink-0 items-center gap-1.5 text-xs text-wrap">
              <span
                className={cn(
                  'flex size-3.5 items-center justify-center rounded-full text-white',
                  lastTestResult.passed
                    ? 'bg-emerald-500 dark:bg-emerald-600'
                    : 'bg-red-500 dark:bg-red-600'
                )}
              >
                {lastTestResult.passed ? (
                  <CheckIcon
                    className="size-2.5"
                    strokeWidth={3.5}
                    aria-hidden="true"
                  />
                ) : (
                  <XIcon
                    className="size-2.5"
                    strokeWidth={3.5}
                    aria-hidden="true"
                  />
                )}
              </span>
              <Trans>
                Tested at{' '}
                {i18n.date(lastTestResult.finishedAt, {
                  timeStyle: 'short'
                })}
              </Trans>
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleTestConnection}
          >
            <UnplugIcon data-icon="inline-start" />
            <Trans>Test connection</Trans>
          </Button>
          <Button type="submit" form="door-locks-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            <Trans>Update config</Trans>
          </Button>

          <span className="mt-2 truncate text-xs text-muted-foreground">
            Last updated 13.04.2026, 11:18 · John Doe
          </span>
        </div>
      </CardFooter>

      {testConfig && (
        <TestConnectionDialog
          open={testDialogOpen}
          onOpenChange={setTestDialogOpen}
          config={testConfig}
          onFinished={setLastTestResult}
        />
      )}
    </Card>
  );
}
