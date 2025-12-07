import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { Shield, ShieldCheck } from 'lucide-react';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemMedia,
  ItemTitle
} from '@/components/ui/item';
import { Switch } from '@/components/ui/switch';

import { cn } from '@/lib/utils';

interface TwoFactorSectionProps {
  isEnabled?: boolean;
}

const twoFactorFormSchema = z.object({
  enabled: z.boolean()
});

type TwoFactorFormData = z.infer<typeof twoFactorFormSchema>;

export function TwoFactorSection({ isEnabled = false }: TwoFactorSectionProps) {
  const { t } = useLingui();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorFormSchema),
    defaultValues: {
      enabled: isEnabled
    }
  });
  const enabled = form.watch('enabled');
  const switchId = useId();

  const handleToggleChange = async (
    checked: boolean,
    previousValue: boolean
  ) => {
    setIsLoading(true);

    try {
      // TODO: Implement API call to enable/disable 2FA
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success(
        checked
          ? t`Two-factor authentication is enabled`
          : t`Two-factor authentication is disabled`
      );
    } catch {
      form.setValue('enabled', previousValue, { shouldDirty: false });
      toast.error(t`Error updating two-factor authentication`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async () => {
    setIsLoading(true);

    try {
      // TODO: Implement 2FA setup flow
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success(t`Two-factor authentication setup initiated`);
    } catch {
      toast.error(t`Error setting up two-factor authentication`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Item variant="outline">
      <ItemHeader>
        <ItemMedia>
          {enabled ? (
            <ShieldCheck className="size-5" />
          ) : (
            <Shield className="size-5" />
          )}
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            <div className="flex items-center gap-2">
              <ItemTitle className="text-base">
                <Trans>Two-Factor Authentication</Trans>
              </ItemTitle>
              {enabled ? (
                <Badge variant="success" appearance="outline">
                  <Trans>Enabled</Trans>
                </Badge>
              ) : (
                <Badge variant="destructive" appearance="outline">
                  <Trans>Disabled</Trans>
                </Badge>
              )}
            </div>{' '}
          </ItemTitle>
          <ItemDescription>
            <Trans>
              Add an extra layer of security to keep your account safe
            </Trans>
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" onClick={handleSetup} loading={isLoading}>
            <Trans>Set up 2FA</Trans>
          </Button>
        </ItemActions>
      </ItemHeader>
      <ItemContent className="space-y-2">
        <p>
          {enabled ? (
            <Trans>Two-factor authentication is active on your account.</Trans>
          ) : (
            <Trans>
              Two-factor authentication isn't set up on your account yet.
            </Trans>
          )}
        </p>

        <p>
          <Trans>You can use any of these popular apps:</Trans>
        </p>

        <div className="flex flex-col items-start space-y-2">
          <a
            href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
            className={cn(
              buttonVariants({
                mode: 'link',
                underline: 'solid'
              }),
              'text-foreground'
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Trans>Google Authenticator ↗</Trans>
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
            className={cn(
              buttonVariants({
                mode: 'link',
                underline: 'solid'
              }),
              'text-foreground'
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Trans>Microsoft Authenticator ↗</Trans>
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
            className={cn(
              buttonVariants({
                mode: 'link',
                underline: 'solid'
              }),
              'text-foreground'
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Trans>Authy ↗</Trans>
          </a>
        </div>
      </ItemContent>

      <ItemFooter>
        <Controller
          control={form.control}
          name="enabled"
          render={({ field, fieldState }) => (
            <Field
              orientation="horizontal"
              data-invalid={fieldState.invalid}
              className="gap-3"
            >
              <FieldContent>
                <FieldLabel htmlFor={switchId}>
                  {enabled ? (
                    <Trans>Two-factor authentication is turned on</Trans>
                  ) : (
                    <Trans>Two-factor authentication is turned off</Trans>
                  )}
                </FieldLabel>
                <FieldDescription>
                  {enabled ? (
                    <Trans>
                      Your account is protected with an extra verification step
                    </Trans>
                  ) : (
                    <Trans>
                      Turn on two-factor authentication for better account
                      security
                    </Trans>
                  )}
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Switch
                id={switchId}
                name={field.name}
                checked={field.value}
                onCheckedChange={(checked) => {
                  const previousValue = field.value ?? false;
                  field.onChange(checked);
                  void handleToggleChange(checked, previousValue);
                }}
                disabled={isLoading}
                aria-invalid={fieldState.invalid}
                className="self-end"
              />
            </Field>
          )}
        />
      </ItemFooter>
    </Item>
  );
}
