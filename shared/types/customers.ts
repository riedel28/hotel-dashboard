import { z } from 'zod';

import {
  countryCodeSchema,
  propertyStageSchema,
  sortOrderSchema
} from './properties';

// Empty input means "no value" for the optional text fields.
const optionalText = z
  .string()
  .trim()
  .max(200)
  .nullish()
  .transform((value) => value || null);

const requiredText = z.string().trim().min(1).max(200);

export const customerInputSchema = z.object({
  first_name: requiredText,
  last_name: requiredText,
  company_name: optionalText,
  email: z.string().trim().max(200).pipe(z.email()),
  address_line_1: requiredText,
  address_line_2: optionalText,
  zip: z.string().trim().min(1).max(20),
  city: requiredText,
  country_code: countryCodeSchema
});

export const createCustomerSchema = customerInputSchema;
export const updateCustomerSchema = customerInputSchema.partial();

export const customerSchema = z.object({
  id: z.uuid(),
  first_name: z.string(),
  last_name: z.string(),
  company_name: z.string().nullable(),
  email: z.string(),
  address_line_1: z.string(),
  address_line_2: z.string().nullable(),
  zip: z.string(),
  city: z.string(),
  country_code: z.string(),
  property_count: z.number().int().nonnegative(),
  // Every Property the Customer owns, by name.
  properties: z.array(z.object({ id: z.uuid(), name: z.string() }))
});

// A single Customer also carries the Properties it owns.
export const customerDetailSchema = customerSchema.extend({
  properties: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      country_code: z.string(),
      stage: propertyStageSchema
    })
  )
});

export const customerSortableColumnsSchema = z.enum([
  'name',
  'email',
  'city',
  'property_count'
]);

export const fetchCustomersParamsSchema = z.object({
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
  sort_by: customerSortableColumnsSchema.optional(),
  sort_order: sortOrderSchema.optional()
});

export const fetchCustomersResponseSchema = z.object({
  index: z.array(customerSchema),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  page_count: z.number().int().nonnegative()
});

export const customerIdParamsSchema = z.object({
  id: z.uuid()
});

/** The one-line name of a Customer: the company if there is one, else the person. */
export function customerLabel(customer: {
  first_name: string;
  last_name: string;
  company_name: string | null;
}): string {
  return (
    customer.company_name || `${customer.first_name} ${customer.last_name}`
  );
}

export type CustomerSortableColumn = z.infer<
  typeof customerSortableColumnsSchema
>;
export type Customer = z.infer<typeof customerSchema>;
export type CustomerDetail = z.infer<typeof customerDetailSchema>;
export type CustomerInput = z.input<typeof customerInputSchema>;
export type CreateCustomerData = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerData = z.infer<typeof updateCustomerSchema>;
export type FetchCustomersParams = z.infer<typeof fetchCustomersParamsSchema>;
export type FetchCustomersResponse = z.infer<
  typeof fetchCustomersResponseSchema
>;
