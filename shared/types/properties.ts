import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { z } from 'zod';

countries.registerLocale(en);

export const countryCodeSchema = z
  .string()
  .min(2)
  .max(2)
  .toUpperCase()
  .refine((code) => countries.isValid(code), {
    message: 'Invalid country code'
  });

export const propertyStageSchema = z.enum([
  'demo',
  'production',
  'staging',
  'template'
]);

// Nav items an Administrator can switch off per Property. `Start` is always
// shown and is deliberately absent.
export const navItemIdSchema = z.enum([
  'monitoring',
  'reservations',
  'rooms',
  'guest-abc',
  'products',
  'pms-provider',
  'door-locks',
  'payment-provider',
  'devices',
  'users'
]);

// Solutions a Property has booked. Listed in display order.
export const propertyOptionSchema = z.enum([
  'mobile_app_native',
  'mobile_app_pwa',
  'checkin_kiosk_app',
  'tv_guest_directory',
  'meldeschein_app',
  'rsx_api',
  'messaging_email',
  'messaging_sms',
  'messaging_whatsapp'
]);

// A bare host: no protocol, port or path.
export const pwaDomainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(253)
  .regex(/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/, {
    message: 'Invalid domain'
  });

// The Customer that owns a Property, as much of it as a Property carries.
// Only Administrators receive it — everyone else gets null.
export const propertyCustomerSchema = z.object({
  id: z.uuid(),
  first_name: z.string(),
  last_name: z.string(),
  company_name: z.string().nullable()
});

export const propertySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  country_code: countryCodeSchema,
  stage: propertyStageSchema,
  disabled_nav_items: z.array(navItemIdSchema),
  options: z.array(propertyOptionSchema),
  // Set exactly when `options` has mobile_app_pwa.
  pwa_domain: z.string().nullable(),
  customer_id: z.uuid().nullable(),
  customer: propertyCustomerSchema.nullable()
});

export const propertySortableColumnsSchema = z.enum([
  'name',
  'country_code',
  'stage',
  'customer'
]);

export const sortOrderSchema = z.enum(['asc', 'desc']);

export const fetchPropertiesParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  per_page: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => [5, 10, 25, 50, 100].includes(val), {
      message: 'per_page must be one of: 5, 10, 25, 50, 100'
    })
    .default(10)
    .optional(),
  q: z.string().max(200).optional(),
  // A list in the URL search params, a comma-separated string on the wire.
  // 'all' is the legacy spelling of "no filter".
  stage: z.preprocess(
    (value) =>
      typeof value === 'string'
        ? value === 'all'
          ? undefined
          : value.split(',')
        : value,
    z.array(propertyStageSchema).optional()
  ),
  country_code: countryCodeSchema.optional(),
  // Same wire format as `stage`. Matches Properties with any of them.
  options: z.preprocess(
    (value) => (typeof value === 'string' ? value.split(',') : value),
    z.array(propertyOptionSchema).optional()
  ),
  sort_by: propertySortableColumnsSchema.optional(),
  sort_order: sortOrderSchema.optional()
});

export const fetchPropertiesResponseSchema = z.object({
  index: z.array(propertySchema),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  page_count: z.number().int().nonnegative()
});

export const createPropertySchema = z.object({
  name: z.string().min(1),
  country_code: countryCodeSchema,
  stage: propertyStageSchema,
  customer_id: z.uuid().nullable().optional()
});

export const updatePropertySchema = propertySchema
  .omit({ id: true, customer: true })
  .extend({
    disabled_nav_items: z
      .array(navItemIdSchema)
      .transform((ids) => [...new Set(ids)]),
    options: z
      .array(propertyOptionSchema)
      .transform((ids) => [...new Set(ids)]),
    pwa_domain: pwaDomainSchema.nullable()
  })
  .partial()
  // The two travel together, so a request can be checked without the stored
  // row: the domain is required with mobile_app_pwa and never sent alone.
  .superRefine((data, ctx) => {
    if (data.options?.includes('mobile_app_pwa') && !data.pwa_domain) {
      ctx.addIssue({
        code: 'custom',
        path: ['pwa_domain'],
        message: 'PWA domain is required for Mobile App (PWA)'
      });
    }
    if (data.pwa_domain !== undefined && !data.options) {
      ctx.addIssue({
        code: 'custom',
        path: ['pwa_domain'],
        message: 'pwa_domain must be sent together with options'
      });
    }
  });

export const propertyIdParamsSchema = z.object({
  id: z.uuid()
});

// Type exports
export type PropertyStage = z.infer<typeof propertyStageSchema>;
export type PropertySortableColumn = z.infer<
  typeof propertySortableColumnsSchema
>;
export type NavItemId = z.infer<typeof navItemIdSchema>;
export type PropertyOption = z.infer<typeof propertyOptionSchema>;
export type Property = z.infer<typeof propertySchema>;
export type PropertyCustomer = z.infer<typeof propertyCustomerSchema>;
export type CreatePropertyData = z.infer<typeof createPropertySchema>;
export type FetchPropertiesParams = z.infer<typeof fetchPropertiesParamsSchema>;
export type FetchPropertiesResponse = z.infer<
  typeof fetchPropertiesResponseSchema
>;
export type UpdatePropertyData = z.infer<typeof updatePropertySchema>;
