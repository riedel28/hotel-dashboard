import { z } from 'zod';

export const propertyStageSchema = z.enum([
  'demo',
  'production',
  'staging',
  'template'
]);

export const propertySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  stage: propertyStageSchema
});

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
  q: z.string().max(200).optional()
});

export const fetchPropertiesResponseSchema = z.object({
  index: z.array(propertySchema),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  page_count: z.number().int().nonnegative()
});

// Type exports
export type PropertyStage = z.infer<typeof propertyStageSchema>;
export type Property = z.infer<typeof propertySchema>;
export type FetchPropertiesParams = z.infer<typeof fetchPropertiesParamsSchema>;
export type FetchPropertiesResponse = z.infer<
  typeof fetchPropertiesResponseSchema
>;
