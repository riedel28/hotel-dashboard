import { z } from 'zod';

// Every provider the picker offers. Only the ones in `saveSchema` below can be
// configured yet; the rest are listed so adding one needs no migration.
export const PAYMENT_PROVIDER_IDS = [
  'adyen',
  'payone',
  'concardis',
  'six_saferpay',
  'valitor'
] as const;

export const paymentProviderIdSchema = z.enum(PAYMENT_PROVIDER_IDS);

const mappingCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{0,12}$/, 'Digits only (max 12)')
  .default('');

const mappingSchema = z
  .object({ ecom: mappingCodeSchema, pos: mappingCodeSchema })
  .default({ ecom: '', pos: '' });

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
  mappings: z
    .object({
      mastercard: mappingSchema,
      visa: mappingSchema,
      amex: mappingSchema,
      paypal: mappingSchema
    })
    .default({
      mastercard: { ecom: '', pos: '' },
      visa: { ecom: '', pos: '' },
      amex: { ecom: '', pos: '' },
      paypal: { ecom: '', pos: '' }
    })
});

// An empty apiKey keeps the stored one.
export const savePaymentProviderSchema = z.object({
  provider: z.literal('adyen'),
  apiKey: z.string().trim().max(500).default(''),
  config: adyenConfigSchema
});

export const paymentProviderSchema = z.object({
  provider: paymentProviderIdSchema,
  apiKeyConfigured: z.boolean(),
  config: adyenConfigSchema,
  updated_at: z.string().datetime()
});

// Null until the property has a provider set up.
export const fetchPaymentProviderResponseSchema =
  paymentProviderSchema.nullable();

export type PaymentProviderId = z.infer<typeof paymentProviderIdSchema>;
export type AdyenConfig = z.infer<typeof adyenConfigSchema>;
export type SavePaymentProviderData = z.input<typeof savePaymentProviderSchema>;
export type PaymentProvider = z.infer<typeof paymentProviderSchema>;
