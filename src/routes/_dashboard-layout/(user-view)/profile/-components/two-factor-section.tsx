import { useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import { Shield, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

import { cn } from '@/lib/utils';

interface TwoFactorSectionProps {
  isEnabled?: boolean;
}

export function TwoFactorSection({ isEnabled = false }: TwoFactorSectionProps) {
  const { t } = useLingui();
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
          ? t`Two-factor authentication is enabled`
          : t`Two-factor authentication is disabled`
      );
    } catch {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? (
            <ShieldCheck className="h-5 w-5 text-green-600" />
          ) : (
            <Shield className="text-muted-foreground h-5 w-5" />
          )}
          <Trans>Two-Factor Authentication</Trans>
          <Badge
            variant="secondary"
            className={
              enabled
                ? 'border-green-200 bg-green-100 text-green-800 hover:bg-green-200'
                : 'border-red-200 bg-red-100 text-red-800 hover:bg-red-200'
            }
          >
            {enabled ? <Trans>Enabled</Trans> : <Trans>Disabled</Trans>}
          </Badge>
        </CardTitle>
        <CardDescription>
          <Trans>
            Add an extra layer of security to keep your account safe
          </Trans>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {!enabled && (
            <div className="space-y-3">
              <p className="text-foreground text-sm">
                <Trans>
                  Two-factor authentication isn't set up on your account yet.
                </Trans>
              </p>
              <p className="text-foreground text-sm">
                <Trans>You can use any of these popular apps:</Trans>
              </p>
              <div className="space-y-2">
                <div>
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
                </div>
                <div>
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
                </div>
                <div>
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
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {enabled ? (
                  <Trans>Two-factor authentication is turned on</Trans>
                ) : (
                  <Trans>Two-factor authentication is turned off</Trans>
                )}
              </p>
              <p className="text-muted-foreground text-sm">
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
                <Trans>Set up 2FA</Trans>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
