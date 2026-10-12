import { z } from 'zod';

// The payment methods an Adyen mapping code can be set for.
export const ADYEN_METHOD_IDS = [
  'mastercard',
  'visa',
  'amex',
  'paypal'
] as const;

// A mapping code: digits only, at most 12, or empty when not set.
const ADYEN_MAPPING_CODE_PATTERN = /^\d{0,12}$/;

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

// SALTO, the door lock system. It is reached either through the PMS interface
// (a host and a port, no credentials) or through SHIP (a user and a password,
// which is its secret). The fields of both ways are kept, so switching between
// them loses nothing; only those of the chosen one have to be filled in.
export const saltoConfigSchema = z
  .object({
    mode: z.enum(['pms', 'ship']),
    host: z.string().trim().max(255).default(''),
    port: z.string().trim().max(5).default(''),
    shipType: z.enum(['stp', 'https']).default('https'),
    shipUrl: z.string().trim().max(500).default(''),
    username: z.string().trim().max(200).default('')
  })
  .superRefine((config, ctx) => {
    const require = (
      field: 'host' | 'shipUrl' | 'username',
      message: string
    ) => {
      if (!config[field])
        ctx.addIssue({ code: 'custom', path: [field], message });
    };

    if (config.mode === 'pms') {
      require('host', 'Host is required');
      if (!isPortNumber(config.port)) {
        ctx.addIssue({
          code: 'custom',
          path: ['port'],
          message: 'Enter a valid port number'
        });
      }
    } else {
      if (config.shipType === 'https')
        require('shipUrl', 'SHIP-URL is required');
      require('username', 'Username is required');
    }
  });

/** A TCP port: digits only, 1 to 65535. */
export function isPortNumber(value: string) {
  return /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 65535;
}

// What a save adds: the provider's secret. An empty one keeps the stored one.
const saving = { secret: z.string().trim().max(500).default('') };

// What the server adds to a stored provider. The secret itself never comes
// back, only whether one is set.
const stored = {
  secretConfigured: z.boolean(),
  updated_at: z.iso.datetime()
};

/**
 * A provider that can be configured: its id paired with its configuration, as
 * a save sends it and as a read returns it.
 *
 * `requiresSecret` says whether it cannot work without a secret, given its
 * configuration. Left out, it always needs one.
 */
function defineProvider<Id extends string, Config extends z.ZodType>(
  id: Id,
  config: Config,
  requiresSecret?: (config: z.infer<Config>) => boolean
) {
  const base = z.object({ provider: z.literal(id), config });
  return {
    config,
    requiresSecret,
    save: base.extend(saving),
    stored: base.extend(stored)
  };
}

// Every provider is defined here, once. Adding one: define it, then list it
// under its kind below.
const providers = {
  adyen: defineProvider('adyen', adyenConfigSchema),
  casablanca: defineProvider('casablanca', casablancaConfigSchema),
  apaleo: defineProvider('apaleo', apaleoConfigSchema),
  // Over the PMS interface SALTO has no credentials
  salto: defineProvider(
    'salto',
    saltoConfigSchema,
    (config) => config.mode === 'ship'
  )
};

// Per kind of provider (a property has one of each): what a save takes and
// what a read returns.
export const saveProviderSchemas = {
  payment: z.discriminatedUnion('provider', [providers.adyen.save]),
  pms: z.discriminatedUnion('provider', [
    providers.casablanca.save,
    providers.apaleo.save
  ]),
  door_lock: z.discriminatedUnion('provider', [providers.salto.save])
};

export const providerSchemas = {
  payment: z.discriminatedUnion('provider', [providers.adyen.stored]),
  pms: z.discriminatedUnion('provider', [
    providers.casablanca.stored,
    providers.apaleo.stored
  ]),
  door_lock: z.discriminatedUnion('provider', [providers.salto.stored])
};

export type ProviderKind = keyof typeof providerSchemas;
export type ProviderId = keyof typeof providers;
export type AdyenMethodId = (typeof ADYEN_METHOD_IDS)[number];

// Null until the property has a provider of that kind set up.
export type Provider<K extends ProviderKind = ProviderKind> = z.infer<
  (typeof providerSchemas)[K]
>;
export type PaymentProvider = Provider<'payment'>;
// What a client sends, and what the server reads after validation.
export type SaveProviderInput<K extends ProviderKind = ProviderKind> = z.input<
  (typeof saveProviderSchemas)[K]
>;
export type SaveProviderData = z.infer<
  (typeof saveProviderSchemas)[ProviderKind]
>;

/** The schema of a provider's configuration: what its form has to satisfy. */
export function providerConfigSchema(provider: ProviderId): z.ZodType {
  return providers[provider].config;
}

/**
 * Whether a provider cannot work without a secret, given its configuration.
 * `config` has to be that provider's own, as a validated save pairs them.
 */
export function requiresSecret(provider: ProviderId, config: object) {
  // The pairing holds for the caller's value, but not for the compiler, which
  // sees every provider's rule and every provider's configuration here.
  const rule = providers[provider].requiresSecret as
    | ((config: object) => boolean)
    | undefined;
  return rule?.(config) ?? true;
}
