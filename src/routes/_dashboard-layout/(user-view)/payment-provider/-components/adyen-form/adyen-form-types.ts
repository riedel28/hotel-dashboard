import type { ProviderFormValues } from '@/components/provider-setup/use-provider-form';

// The stored configuration plus the API key, which only ever travels to the
// server: an empty one keeps the key already stored.
export type AdyenFormData = ProviderFormValues<'payment', 'adyen'>;
