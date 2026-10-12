import { z } from 'zod';

// What a property can be connected to. Each kind has one provider at a time.
export const PROVIDER_KINDS = ['payment', 'pms', 'door_lock'] as const;

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

// Casablanca and Apaleo, the property management systems. As with Adyen, the
// secret (Casablanca's token, Apaleo's secret code) is kept apart from these.
export const casablancaConfigSchema = z.object({
  hotelId: z.string().trim().min(1, 'Hotel ID is required').max(200),
  sendInvoiceViaPms: z.boolean().default(false),
  // The service code that skips payment at check-in
  mockCode: z.string().trim().max(100).default('')
});

export const apaleoConfigSchema = z.object({
  clientId: z.string().trim().min(1, 'Client ID is required').max(200),
  propertyId: z.string().trim().min(1, 'Property ID is required').max(100),
  useApaleoPaymentPos: z.boolean().default(false),
  useApaleoPaymentEcom: z.boolean().default(false),
  groupFolioByRatePlan: z.boolean().default(false)
});

// A provider paired with its own configuration. The unions below take one
// member per provider that can be configured, told apart by `provider`.
const adyenSchema = z.object({
  provider: z.literal('adyen'),
  config: adyenConfigSchema
});

const casablancaSchema = z.object({
  provider: z.literal('casablanca'),
  config: casablancaConfigSchema
});

const apaleoSchema = z.object({
  provider: z.literal('apaleo'),
  config: apaleoConfigSchema
});

// What a save adds: the provider's secret. An empty one keeps the stored one.
const saving = { secret: z.string().trim().max(500).default('') };

// What the server adds to a stored provider. The secret itself never comes
// back, only whether one is set.
const stored = {
  secretConfigured: z.boolean(),
  updated_at: z.iso.datetime(),
  // Null once the user has been deleted.
  updated_by: z
    .object({
      id: z.number().int().positive(),
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      email: z.string()
    })
    .nullable()
};

// Per kind: what a save takes and what a read returns. A kind missing here
// cannot be configured yet.
export const saveProviderSchemas = {
  payment: z.discriminatedUnion('provider', [adyenSchema.extend(saving)]),
  pms: z.discriminatedUnion('provider', [
    casablancaSchema.extend(saving),
    apaleoSchema.extend(saving)
  ])
};

export const providerSchemas = {
  payment: z.discriminatedUnion('provider', [adyenSchema.extend(stored)]),
  pms: z.discriminatedUnion('provider', [
    casablancaSchema.extend(stored),
    apaleoSchema.extend(stored)
  ])
};

export type ProviderKind = (typeof PROVIDER_KINDS)[number];
export type ConfigurableKind = keyof typeof providerSchemas;
export type AdyenMethodId = (typeof ADYEN_METHOD_IDS)[number];
export type AdyenConfig = z.infer<typeof adyenConfigSchema>;
export type CasablancaConfig = z.infer<typeof casablancaConfigSchema>;
export type ApaleoConfig = z.infer<typeof apaleoConfigSchema>;

// Null until the property has a provider of that kind set up.
export type Provider<K extends ConfigurableKind = ConfigurableKind> = z.infer<
  (typeof providerSchemas)[K]
>;
export type PaymentProvider = Provider<'payment'>;
export type PmsProvider = Provider<'pms'>;
// What a client sends, and what the server reads after validation.
export type SaveProviderInput<K extends ConfigurableKind = ConfigurableKind> =
  z.input<(typeof saveProviderSchemas)[K]>;
export type SaveProviderData = z.infer<
  (typeof saveProviderSchemas)[ConfigurableKind]
>;
