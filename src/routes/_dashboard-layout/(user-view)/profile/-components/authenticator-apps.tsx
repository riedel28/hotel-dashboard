import { Trans } from '@lingui/react/macro';
import { ArrowUpRightIcon, ChevronDownIcon } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';

/**
 * Three apps × two stores is six links. As six official store badges they'd
 * shout louder than the primary action and read as advertising, so they're
 * small text links behind a closed disclosure instead.
 */
const AUTHENTICATOR_APPS = [
  {
    name: 'Google Authenticator',
    appStore: 'https://apps.apple.com/app/google-authenticator/id388497605',
    playStore:
      'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2'
  },
  {
    name: 'Microsoft Authenticator',
    appStore: 'https://apps.apple.com/app/microsoft-authenticator/id983156458',
    playStore:
      'https://play.google.com/store/apps/details?id=com.azure.authenticator'
  },
  {
    name: 'Twilio Authy',
    appStore: 'https://apps.apple.com/app/twilio-authy/id494168017',
    playStore: 'https://play.google.com/store/apps/details?id=com.authy.authy'
  }
] as const;

function StoreLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      {children}
      <ArrowUpRightIcon className="size-3" aria-hidden="true" />
      <span className="sr-only">
        <Trans>(opens in new tab)</Trans>
      </span>
    </a>
  );
}

export function AuthenticatorApps() {
  return (
    <Collapsible>
      <CollapsibleTrigger className="group/apps flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        <ChevronDownIcon
          className="size-4 transition-transform group-data-[panel-open]/apps:rotate-180"
          aria-hidden="true"
        />
        <Trans>Which authenticator app should I use?</Trans>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 space-y-2.5 rounded-lg border p-3 text-sm">
          <p className="text-muted-foreground">
            <Trans>Free apps that work with any account:</Trans>
          </p>
          <ul className="space-y-2">
            {AUTHENTICATOR_APPS.map((app) => (
              <li
                key={app.name}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
              >
                <span>{app.name}</span>
                <span className="flex items-center gap-3 text-xs">
                  <StoreLink href={app.appStore}>App Store</StoreLink>
                  <StoreLink href={app.playStore}>Google Play</StoreLink>
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t pt-2.5 text-xs text-muted-foreground">
            <Trans>
              Already have one? Any TOTP app works — just scan the QR code.
            </Trans>
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
