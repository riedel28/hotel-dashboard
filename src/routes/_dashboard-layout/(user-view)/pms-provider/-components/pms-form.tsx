import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { ArrowUpRightIcon, Loader2Icon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/ui/link';
import { PasswordInput } from '@/components/ui/password-input';
import { Switch } from '@/components/ui/switch';

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
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    toast.success(t`Config updated`);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center-safe gap-2">
              <CardTitle>
                <Trans>Casablanca</Trans>
              </CardTitle>

              <Badge
                variant="outline"
                size="sm"
                className="bg-accent text-accent-foreground text-[11px] rounded-md cursor-pointer"
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
              src="/casablanca-logo.png"
              alt="Casablanca"
              className="max-h-9 max-w-full object-contain dark:hidden"
            />
            <img
              src="/casablanca-logo-inverse.png"
              alt="Casablanca"
              className="hidden max-h-9 max-w-full object-contain dark:block"
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
                onChange={event =>
                  setFormState(current => ({
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
                onChange={event =>
                  setFormState(current => ({
                    ...current,
                    token: event.target.value
                  }))
                }
              />
            </Field>

            <Field orientation="horizontal" className="justify-between gap-3">
              <FieldContent>
                <FieldLabel htmlFor="send_invoice_via_pms">
                  <Trans>Send invoice via PMS</Trans>
                </FieldLabel>
                <FieldDescription>
                  <Trans>The invoice will be sent directly to the PMS</Trans>
                </FieldDescription>
              </FieldContent>
              <Switch
                id="send_invoice_via_pms"
                name="send_invoice_via_pms"
                checked={formState.sendInvoiceViaPms}
                onCheckedChange={checked =>
                  setFormState(current => ({
                    ...current,
                    sendInvoiceViaPms: checked
                  }))
                }
                className="self-start"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="mock_code">
                <Trans>Mock code</Trans>
              </FieldLabel>
              <Input
                id="mock_code"
                name="mock_code"
                type="text"
                value={formState.mockCode}
                onChange={event =>
                  setFormState(current => ({
                    ...current,
                    mockCode: event.target.value
                  }))
                }
              />
              <FieldDescription>
                <Trans>
                  This is the service code that will be used to skip payment at
                  check-in.
                </Trans>
              </FieldDescription>
            </Field>
          </FieldGroup>

          <div className="flex flex-col justify-end gap-4 items-end mt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Trans>Update config</Trans>
            </Button>
            <span className="truncate text-xs text-muted-foreground">
              Last updated 13.04.2026, 11:18 · John Doe
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
