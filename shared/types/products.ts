import { z } from 'zod';

const idSchema = z.number().int().positive();

const titleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(200, 'Title must be at most 200 characters');

// Matches numeric(10,2): up to 99,999,999.99, at most two decimals.
const priceSchema = z
  .number({ message: 'Price is required' })
  .min(0, 'Price must be 0 or greater')
  .max(99_999_999.99, 'Price is too large')
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6, {
    message: 'Price must have at most two decimals'
  });

const quantitySchema = z
  .number({ message: 'Quantity is required' })
  .int('Quantity must be a whole number')
  .min(0, 'Quantity must be 0 or greater')
  .max(1_000_000, 'Quantity is too large');

// Plain text for now; rich text (HTML) is tracked in #30. Empty → null.
const descriptionSchema = z
  .string()
  .trim()
  .max(5000, 'Description must be at most 5000 characters')
  .transform((value) => (value === '' ? null : value))
  .nullable();

// --- Categories ---

export const productCategorySchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  parent_id: idSchema.nullable()
});

export const fetchProductCategoriesResponseSchema = z.array(
  productCategorySchema
);

export const createProductCategorySchema = z.object({
  title: titleSchema,
  parent_id: idSchema.nullable().optional()
});

export const updateProductCategorySchema = z.object({
  title: titleSchema.optional(),
  parent_id: idSchema.nullable().optional()
});

// --- Products ---

export const productSchema = z.object({
  id: idSchema,
  category_id: idSchema,
  title: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  description: z.string().nullable()
});

export const fetchProductsResponseSchema = z.array(productSchema);

export const fetchProductsParamsSchema = z.object({
  category_id: z.coerce.number().int().positive().optional()
});

export const createProductSchema = z.object({
  category_id: idSchema,
  title: titleSchema,
  price: priceSchema,
  quantity: quantitySchema,
  description: descriptionSchema.optional()
});

export const updateProductSchema = createProductSchema.partial();

// Shared by both resources
export const productIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

// Type exports
export type ProductCategory = z.infer<typeof productCategorySchema>;
export type CreateProductCategoryData = z.infer<
  typeof createProductCategorySchema
>;
export type UpdateProductCategoryData = z.infer<
  typeof updateProductCategorySchema
>;
export type Product = z.infer<typeof productSchema>;
export type FetchProductsParams = z.infer<typeof fetchProductsParamsSchema>;
export type CreateProductData = z.input<typeof createProductSchema>;
export type UpdateProductData = z.input<typeof updateProductSchema>;
