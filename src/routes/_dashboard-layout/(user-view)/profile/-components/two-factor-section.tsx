import { useState } from 'react';

import { Shield, ShieldCheck } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ExternalLink } from '@/components/ui/external-link';
import { Switch } from '@/components/ui/switch';

interface TwoFactorSectionProps {
  isEnabled?: boolean;
}

export function TwoFactorSection({ isEnabled = false }: TwoFactorSectionProps) {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [enabled, setEnabled] = useState(isEnabled);

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);

    try {
      // TODO: Implement API call to enable/disable 2FA
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setEnabled(checked);

      toast.success(
        checked
          ? intl.formatMessage({
              id: 'profile.twoFactor.enabled',
              defaultMessage: 'Two-factor authentication is enabled'
            })
          : intl.formatMessage({
              id: 'profile.twoFactor.disabled',
              defaultMessage: 'Two-factor authentication is disabled'
            })
      );
    } catch {
      toast.error('Error updating two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async () => {
    setIsLoading(true);

    try {
      // TODO: Implement 2FA setup flow
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success('Two-factor authentication setup initiated');
    } catch {
      toast.error('Error setting up two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? (
            <ShieldCheck className="h-5 w-5 text-green-600" />
          ) : (
            <Shield className="text-muted-foreground h-5 w-5" />
          )}
          <FormattedMessage
            id="profile.twoFactor.title"
            defaultMessage="Two-Factor Authentication"
          />
          <Badge
            variant="secondary"
            className={
              enabled
                ? 'border-green-200 bg-green-100 text-green-800 hover:bg-green-200'
                : 'border-red-200 bg-red-100 text-red-800 hover:bg-red-200'
            }
          >
            {enabled ? (
              <FormattedMessage
                id="profile.twoFactor.status.enabled"
                defaultMessage="Enabled"
              />
            ) : (
              <FormattedMessage
                id="profile.twoFactor.status.disabled"
                defaultMessage="Disabled"
              />
            )}
          </Badge>
        </CardTitle>
        <CardDescription>
          <FormattedMessage
            id="profile.twoFactor.description"
            defaultMessage="Add an extra layer of security to keep your account safe"
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {!enabled && (
            <div className="space-y-3">
              <p className="text-foreground text-sm">
                <FormattedMessage
                  id="profile.twoFactor.disabled.message"
                  defaultMessage="Two-factor authentication isn't set up on your account yet."
                />
              </p>
              <p className="text-foreground text-sm">
                <FormattedMessage
                  id="profile.twoFactor.apps.intro"
                  defaultMessage="You can use any of these popular apps:"
                />
              </p>
              <div className="space-y-2">
                <div>
                  <ExternalLink href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2">
                    <FormattedMessage
                      id="profile.twoFactor.apps.google"
                      defaultMessage="Google Authenticator"
                    />
                  </ExternalLink>
                </div>
                <div>
                  <ExternalLink href="https://www.microsoft.com/en-us/account/authenticator">
                    <FormattedMessage
                      id="profile.twoFactor.apps.microsoft"
                      defaultMessage="Microsoft Authenticator"
                    />
                  </ExternalLink>
                </div>
                <div>
                  <ExternalLink href="https://authy.com/">
                    <FormattedMessage
                      id="profile.twoFactor.apps.authy"
                      defaultMessage="Authy"
                    />
                  </ExternalLink>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {enabled ? (
                  <FormattedMessage
                    id="profile.twoFactor.enabled"
                    defaultMessage="Two-factor authentication is turned on"
                  />
                ) : (
                  <FormattedMessage
                    id="profile.twoFactor.disabled"
                    defaultMessage="Two-factor authentication is turned off"
                  />
                )}
              </p>
              <p className="text-muted-foreground text-sm">
                {enabled ? (
                  <FormattedMessage
                    id="profile.twoFactor.enabled.description"
                    defaultMessage="Your account is protected with an extra verification step"
                  />
                ) : (
                  <FormattedMessage
                    id="profile.twoFactor.disabled.description"
                    defaultMessage="Turn on two-factor authentication for better account security"
                  />
                )}
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={isLoading}
            />
          </div>

          {!enabled && (
            <div className="flex justify-end">
              <Button
                onClick={handleSetup}
                loading={isLoading}
                variant="outline"
              >
                <FormattedMessage
                  id="profile.twoFactor.setup"
                  defaultMessage="Set up 2FA"
                />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
