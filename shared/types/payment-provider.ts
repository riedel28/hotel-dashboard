import { z } from 'zod';

// Every provider the picker offers. Only the ones with a member in the unions
// below can be configured yet; the rest are listed so adding one needs no
// migration.
export const PAYMENT_PROVIDER_IDS = [
  'adyen',
  'payone',
  'concardis',
  'six_saferpay',
  'valitor'
] as const;

export const paymentProviderIdSchema = z.enum(PAYMENT_PROVIDER_IDS);

// The payment methods an Adyen mapping code can be set for.
export const ADYEN_METHOD_IDS = [
  'mastercard',
  'visa',
  'amex',
  'paypal'
] as const;

// A mapping code: digits only, at most 12, or empty when not set.
export const ADYEN_MAPPING_CODE_PATTERN = /^\d{0,12}$/;

const mappingCodeSchema = z
  .string()
  .trim()
  .regex(ADYEN_MAPPING_CODE_PATTERN, 'Digits only (max 12)')
  .default('');

// Every method is always present: a missing one is filled in empty.
const adyenMappingsSchema = z
  .record(
    z.enum(ADYEN_METHOD_IDS),
    z.object({ ecom: mappingCodeSchema, pos: mappingCodeSchema }).prefault({})
  )
  .prefault({});

export const EMPTY_ADYEN_MAPPINGS = adyenMappingsSchema.parse({});

// Everything about an Adyen connection except the API key, which is stored
// encrypted beside it and never sent back to the client.
//
// The recipient address and mapping codes are optional here: a provider is set
// up with credentials alone and completed afterwards.
export const adyenConfigSchema = z.object({
  environment: z.enum(['test', 'live']),
  merchantId: z.string().trim().min(1, 'Merchant ID is required').max(200),
  clientKey: z.string().trim().min(1, 'Client Key is required').max(500),
  publicKey: z.string().trim().max(2000).default(''),
  additionalConfig: z.string().max(10000).default(''),
  addressLine1: z.string().trim().max(200).default(''),
  addressLine2: z.string().trim().max(200).default(''),
  zip: z.string().trim().max(20).default(''),
  city: z.string().trim().max(100).default(''),
  country: z.string().trim().max(2).default(''),
  mappings: adyenMappingsSchema
});

// A provider paired with its own configuration. Both unions below take one
// member per provider that can be configured, told apart by `provider`.
const adyenSchema = z.object({
  provider: z.literal('adyen'),
  config: adyenConfigSchema
});

// An empty apiKey keeps the stored one.
const apiKeySchema = z.string().trim().max(500).default('');

export const savePaymentProviderSchema = z.discriminatedUnion('provider', [
  adyenSchema.extend({ apiKey: apiKeySchema })
]);

export const paymentProviderSchema = z.discriminatedUnion('provider', [
  adyenSchema.extend({
    apiKeyConfigured: z.boolean(),
    updated_at: z.string().datetime()
  })
]);

// Null until the property has a provider set up.
export const fetchPaymentProviderResponseSchema =
  paymentProviderSchema.nullable();

export type PaymentProviderId = z.infer<typeof paymentProviderIdSchema>;
export type AdyenMethodId = (typeof ADYEN_METHOD_IDS)[number];
export type AdyenConfig = z.infer<typeof adyenConfigSchema>;
export type SavePaymentProviderData = z.input<typeof savePaymentProviderSchema>;
export type SavedPaymentProviderData = z.infer<
  typeof savePaymentProviderSchema
>;
export type PaymentProvider = z.infer<typeof paymentProviderSchema>;
