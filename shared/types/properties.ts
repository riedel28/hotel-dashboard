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

export const propertySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  country_code: countryCodeSchema,
  stage: propertyStageSchema
});

export const propertySortableColumnsSchema = z.enum([
  'name',
  'country_code',
  'stage'
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
  stage: z
    .enum(['demo', 'production', 'staging', 'template', 'all'])
    .optional(),
  country_code: countryCodeSchema.optional(),
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
  stage: propertyStageSchema
});

export const updatePropertySchema = propertySchema.omit({ id: true }).partial();

export const propertyIdParamsSchema = z.object({
  id: z.uuid()
});

// Type exports
export type PropertyStage = z.infer<typeof propertyStageSchema>;
export type Property = z.infer<typeof propertySchema>;
export type CreatePropertyData = z.infer<typeof createPropertySchema>;
export type FetchPropertiesParams = z.infer<typeof fetchPropertiesParamsSchema>;
export type FetchPropertiesResponse = z.infer<
  typeof fetchPropertiesResponseSchema
>;
export type UpdatePropertyData = z.infer<typeof updatePropertySchema>;
