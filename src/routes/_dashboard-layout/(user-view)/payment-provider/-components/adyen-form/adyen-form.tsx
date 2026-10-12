import type { ProviderFormProps } from '@/components/provider-setup/types';

import { AdyenSettingsForm } from './adyen-settings-form';
import { AdyenSetupCard } from './adyen-setup-card';

/**
 * Adyen takes two screens: it is connected with its credentials alone, and the
 * recipient and mapping codes follow in the full settings.
 */
export function AdyenForm({ saved, ...props }: ProviderFormProps<'payment'>) {
  return saved ? (
    <AdyenSettingsForm saved={saved} {...props} />
  ) : (
    <AdyenSetupCard {...props} />
  );
}
