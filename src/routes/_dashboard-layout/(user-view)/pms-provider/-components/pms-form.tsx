import { Trans } from '@lingui/react/macro';
import { ArrowUpRightIcon, InfoIcon } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface PmsFormState {
  hotelId: string;
  token: string;
  sendInvoiceViaPms: boolean;
  mockCode: string;
}

export function PmsForm() {
  const [formState, setFormState] = React.useState<PmsFormState>({
    hotelId: '',
    token: '',
    sendInvoiceViaPms: false,
    mockCode: ''
  });

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle>
              <Trans>Casablanca</Trans>
            </CardTitle>
            <a
              href="https://docs.casablanca.dev/hotel-dashboard-integration"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Badge
                size="xs"
                variant="outline"
                color="gray"
                className="[&>svg]:size-3 dark:bg-accent rounded-md"
              >
                Integration Guide
                <ArrowUpRightIcon aria-hidden="true" />
              </Badge>
            </a>
          </div>
          <div className="flex h-10 w-24 shrink-0 items-center justify-end">
            <img
              src="/casablanca-logo.png"
              alt="Casablanca"
              className="max-h-8 max-w-full object-contain dark:hidden"
            />
            <img
              src="/casablanca-logo-inverse.png"
              alt="Casablanca"
              className="hidden max-h-8 max-w-full object-contain dark:block"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="hotel_id">
                <Trans>Hotel ID</Trans>
              </FieldLabel>
              <Input
                id="hotel_id"
                name="hotel_id"
                type="text"
                value={formState.hotelId}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    hotelId: event.target.value
                  }))
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="token">
                <Trans>Token</Trans>
              </FieldLabel>
              <PasswordInput
                id="token"
                name="token"
                value={formState.token}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    token: event.target.value
                  }))
                }
              />
            </Field>

            <Field orientation="horizontal" className="justify-between">
              <FieldLabel
                htmlFor="send_invoice_via_pms"
                className="mt-2 border border-input p-2.5 dark:bg-input/30 rounded-lg flex justify-between"
              >
                <div className="flex flex-col gap-1">
                  <Trans>Send invoice via PMS</Trans>
                  <p className="text-sm text-muted-foreground">
                    <Trans>The invoice will be sent directly to the PMS</Trans>
                  </p>
                </div>
                <Switch
                  id="send_invoice_via_pms"
                  name="send_invoice_via_pms"
                  checked={formState.sendInvoiceViaPms}
                  onCheckedChange={(checked) =>
                    setFormState((current) => ({
                      ...current,
                      sendInvoiceViaPms: checked
                    }))
                  }
                />
              </FieldLabel>
            </Field>

            <Field>
              <div className="flex items-center gap-1.5">
                <FieldLabel htmlFor="mock_code">
                  <Trans>Mock code</Trans>
                </FieldLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-lg"
                          aria-label="mock_code info"
                        >
                          <InfoIcon className="size-4" aria-hidden="true" />
                        </button>
                      }
                    />
                    <TooltipContent>
                      This is the service code that will be used to skip payment
                      at check-in.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="mock_code"
                name="mock_code"
                type="text"
                value={formState.mockCode}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    mockCode: event.target.value
                  }))
                }
              />
            </Field>
          </FieldGroup>

          <div className="flex justify-between gap-2 items-center">
            <p className="text-[12px] text-muted-foreground text-balance">
              Last updated at 13.04.2026, 11:18:17 by John Doe
            </p>
            <Button type="submit">
              <Trans>Update config</Trans>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
