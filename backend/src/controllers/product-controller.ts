import { and, asc, eq } from 'drizzle-orm';

import type {
  CreateProductCategoryData,
  CreateProductData,
  FetchProductsParams,
  UpdateProductCategoryData,
  UpdateProductData
} from '../../../shared/types/products';
import { db } from '../db/pool';
import {
  type Product,
  productCategories,
  type ProductCategory,
  products
} from '../db/schema';
import { isForeignKeyViolation, withFailMessage } from '../middleware/error';
import {
  requireSelectedProperty,
  type SelectedPropertyRequest
} from '../middleware/selected-property';
import { sanitizeRichText } from '../utils/rich-text';

// Property scope is resolved by attachSelectedProperty. Without a selected
// property, lists are empty, single reads are 404 and writes are 400.
type ProductsRequest = SelectedPropertyRequest;
// Unexpected errors are logged and answered with a 500 naming the operation.
const handle = withFailMessage<ProductsRequest>;

// Runs a write whose row references a category. The reference was checked
// just before, but the category can be deleted in between: the foreign key
// then rejects the write, which is the same "not found" to the client.
async function orNotFound<T>(write: PromiseLike<T>) {
  try {
    return await write;
  } catch (error) {
    if (isForeignKeyViolation(error)) return null;
    throw error;
  }
}

function transformCategory(category: ProductCategory) {
  return {
    id: category.id,
    title: category.title,
    parent_id: category.parent_id
  };
}

function transformProduct(product: Product) {
  return {
    id: product.id,
    category_id: product.category_id,
    title: product.title,
    // numeric comes back from pg as a string
    price: Number(product.price),
    quantity: product.quantity,
    description: product.description
  };
}

function findCategory(id: number, propertyId: string) {
  return db.query.productCategories.findFirst({
    where: and(
      eq(productCategories.id, id),
      eq(productCategories.property_id, propertyId)
    )
  });
}

// Why `parentId` can't become the parent of `categoryId`, or null if it can:
// it must be a category of the same property and neither the category itself
// nor one of its descendants.
function invalidParentReason(
  parentOf: Map<number, number | null>,
  categoryId: number,
  parentId: number
) {
  if (!parentOf.has(parentId)) {
    return 'Parent category not found';
  }
  let current: number | null | undefined = parentId;
  const seen = new Set<number>();
  while (current != null && !seen.has(current)) {
    if (current === categoryId) {
      return 'A category cannot be moved into itself or its subcategory';
    }
    seen.add(current);
    current = parentOf.get(current);
  }
  return null;
}

// --- Categories ---

const getProductCategories = handle(
  'Failed to fetch product categories',
  async (req, res) => {
    const propertyId = req.selectedPropertyId ?? null;
    if (!propertyId) {
      return res.status(200).json([]);
    }

    const categories = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.property_id, propertyId))
      .orderBy(asc(productCategories.title));

    res.status(200).json(categories.map(transformCategory));
  }
);

const getProductCategoryById = handle(
  'Failed to fetch product category',
  async (req, res) => {
    const propertyId = req.selectedPropertyId ?? null;
    const category = propertyId
      ? await findCategory(Number(req.params.id), propertyId)
      : undefined;
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(transformCategory(category));
  }
);

const createProductCategory = handle(
  'Failed to create category',
  async (req, res) => {
    const propertyId = requireSelectedProperty(req, res);
    if (!propertyId) return;

    const { title, parent_id } = req.body as CreateProductCategoryData;
    if (parent_id != null && !(await findCategory(parent_id, propertyId))) {
      return res.status(400).json({ error: 'Parent category not found' });
    }

    const created = await orNotFound(
      db
        .insert(productCategories)
        .values({
          property_id: propertyId,
          title,
          parent_id: parent_id ?? null
        })
        .returning()
    );
    if (!created) {
      return res.status(400).json({ error: 'Parent category not found' });
    }
    const [category] = created;
    if (!category) {
      return res.status(500).json({ error: 'Failed to create category' });
    }

    res.status(201).json(transformCategory(category));
  }
);

const updateProductCategory = handle(
  'Failed to update category',
  async (req, res) => {
    const propertyId = requireSelectedProperty(req, res);
    if (!propertyId) return;

    const id = Number(req.params.id);
    // Validated by updateProductCategorySchema: only `title` and `parent_id`.
    const updates = req.body as UpdateProductCategoryData;

    const result = await db.transaction(async (tx) => {
      if (updates.parent_id != null) {
        // Lock the property's categories for the rest of the transaction, so
        // the parent can't vanish and two concurrent moves can't each pass
        // the check and form a cycle together.
        const rows = await tx
          .select({
            id: productCategories.id,
            parent_id: productCategories.parent_id
          })
          .from(productCategories)
          .where(eq(productCategories.property_id, propertyId))
          .for('update');
        const error = invalidParentReason(
          new Map(rows.map((row) => [row.id, row.parent_id])),
          id,
          updates.parent_id
        );
        if (error) return { error };
      }

      const [category] = await tx
        .update(productCategories)
        .set({ ...updates, updated_at: new Date() })
        .where(
          and(
            eq(productCategories.id, id),
            eq(productCategories.property_id, propertyId)
          )
        )
        .returning();
      return { category };
    });

    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }
    if (!result.category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(transformCategory(result.category));
  }
);

const deleteProductCategory = handle(
  'Failed to delete category',
  async (req, res) => {
    const propertyId = requireSelectedProperty(req, res);
    if (!propertyId) return;

    // The FKs reject deleting a category that still has subcategories or
    // products — atomically, unlike a check-then-delete.
    const deleted = await db
      .delete(productCategories)
      .where(
        and(
          eq(productCategories.id, Number(req.params.id)),
          eq(productCategories.property_id, propertyId)
        )
      )
      .returning({ id: productCategories.id })
      .catch((error: unknown) => {
        if (isForeignKeyViolation(error)) return 'not-empty' as const;
        throw error;
      });

    if (deleted === 'not-empty') {
      return res.status(409).json({
        error:
          'Category is not empty. Move or delete its subcategories and products first.'
      });
    }
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  }
);

// --- Products ---

const getProducts = handle('Failed to fetch products', async (req, res) => {
  const propertyId = req.selectedPropertyId ?? null;
  if (!propertyId) {
    return res.status(200).json([]);
  }

  // Query is validated + coerced by validateQuery(fetchProductsParamsSchema).
  const { category_id } = req.query as FetchProductsParams;

  const rows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.property_id, propertyId),
        category_id === undefined
          ? undefined
          : eq(products.category_id, category_id)
      )
    )
    .orderBy(asc(products.title));

  res.status(200).json(rows.map(transformProduct));
});

const getProductById = handle('Failed to fetch product', async (req, res) => {
  const propertyId = req.selectedPropertyId ?? null;
  const product = propertyId
    ? await db.query.products.findFirst({
        where: and(
          eq(products.id, Number(req.params.id)),
          eq(products.property_id, propertyId)
        )
      })
    : undefined;
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.status(200).json(transformProduct(product));
});

const createProduct = handle('Failed to create product', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  const { price, description, ...rest } = req.body as CreateProductData;
  if (!(await findCategory(rest.category_id, propertyId))) {
    return res.status(400).json({ error: 'Category not found' });
  }

  const created = await orNotFound(
    db
      .insert(products)
      .values({
        ...rest,
        price: price.toFixed(2),
        description: sanitizeRichText(description),
        property_id: propertyId
      })
      .returning()
  );
  if (!created) {
    return res.status(400).json({ error: 'Category not found' });
  }
  const [product] = created;
  if (!product) {
    return res.status(500).json({ error: 'Failed to create product' });
  }

  res.status(201).json(transformProduct(product));
});

const updateProduct = handle('Failed to update product', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  // Only the fields that were sent are written.
  const { price, description, ...rest } = req.body as UpdateProductData;
  if (
    rest.category_id !== undefined &&
    !(await findCategory(rest.category_id, propertyId))
  ) {
    return res.status(400).json({ error: 'Category not found' });
  }

  const updated = await orNotFound(
    db
      .update(products)
      .set({
        ...rest,
        ...(price !== undefined && { price: price.toFixed(2) }),
        ...(description !== undefined && {
          description: sanitizeRichText(description)
        }),
        updated_at: new Date()
      })
      .where(
        and(
          eq(products.id, Number(req.params.id)),
          eq(products.property_id, propertyId)
        )
      )
      .returning()
  );
  if (!updated) {
    return res.status(400).json({ error: 'Category not found' });
  }
  const [product] = updated;
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.status(200).json(transformProduct(product));
});

const deleteProduct = handle('Failed to delete product', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  const [deleted] = await db
    .delete(products)
    .where(
      and(
        eq(products.id, Number(req.params.id)),
        eq(products.property_id, propertyId)
      )
    )
    .returning();

  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.status(200).json({ message: 'Product deleted successfully' });
});

export {
  createProduct,
  createProductCategory,
  deleteProduct,
  deleteProductCategory,
  getProductById,
  getProductCategories,
  getProductCategoryById,
  getProducts,
  updateProduct,
  updateProductCategory
};
