import { and, asc, eq } from 'drizzle-orm';
import type { Response } from 'express';

import type {
  CreateProductCategoryData,
  CreateProductData,
  FetchProductsParams,
  UpdateProductCategoryData,
  UpdateProductData
} from '../../../shared/types/products';
import { db } from '../db/pool';
import {
  type NewProduct,
  type NewProductCategory,
  type Product,
  productCategories,
  type ProductCategory,
  products
} from '../db/schema';
import type { AuthenticatedRequest } from '../middleware/auth';

// Property scope is resolved by attachSelectedProperty (guest-abc-controller).
interface ProductsRequest extends AuthenticatedRequest {
  selectedPropertyId?: string | null;
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

// True if making `parentId` the parent of `categoryId` would create a cycle,
// i.e. `parentId` is the category itself or one of its descendants.
async function createsCycle(
  categoryId: number,
  parentId: number,
  propertyId: string
) {
  const rows = await db
    .select({
      id: productCategories.id,
      parent_id: productCategories.parent_id
    })
    .from(productCategories)
    .where(eq(productCategories.property_id, propertyId));
  const parentOf = new Map(rows.map((row) => [row.id, row.parent_id]));

  let current: number | null | undefined = parentId;
  const seen = new Set<number>();
  while (current != null && !seen.has(current)) {
    if (current === categoryId) return true;
    seen.add(current);
    current = parentOf.get(current);
  }
  return false;
}

// --- Categories ---

async function getProductCategories(req: ProductsRequest, res: Response) {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch product categories' });
  }
}

async function getProductCategoryById(req: ProductsRequest, res: Response) {
  try {
    const propertyId = req.selectedPropertyId ?? null;
    const category = propertyId
      ? await findCategory(Number(req.params.id), propertyId)
      : undefined;
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(transformCategory(category));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch product category' });
  }
}

async function createProductCategory(req: ProductsRequest, res: Response) {
  try {
    const propertyId = req.selectedPropertyId ?? null;
    if (!propertyId) {
      return res.status(400).json({ error: 'No property selected' });
    }

    const { title, parent_id } = req.body as CreateProductCategoryData;
    if (parent_id != null && !(await findCategory(parent_id, propertyId))) {
      return res.status(400).json({ error: 'Parent category not found' });
    }

    const [category] = await db
      .insert(productCategories)
      .values({ property_id: propertyId, title, parent_id: parent_id ?? null })
      .returning();

    if (!category) {
      return res.status(500).json({ error: 'Failed to create category' });
    }

    res.status(201).json(transformCategory(category));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create category' });
  }
}

async function updateProductCategory(req: ProductsRequest, res: Response) {
  try {
    const propertyId = req.selectedPropertyId ?? null;
    if (!propertyId) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const id = Number(req.params.id);
    const { title, parent_id } = (req.body ?? {}) as UpdateProductCategoryData;

    const updates: Partial<Pick<NewProductCategory, 'title' | 'parent_id'>> =
      {};
    if (title !== undefined) {
      updates.title = title;
    }
    if (parent_id !== undefined) {
      if (parent_id !== null) {
        if (!(await findCategory(parent_id, propertyId))) {
          return res.status(400).json({ error: 'Parent category not found' });
        }
        if (await createsCycle(id, parent_id, propertyId)) {
          return res.status(400).json({
            error: 'A category cannot be moved into itself or its subcategory'
          });
        }
      }
      updates.parent_id = parent_id;
    }

    const [category] = await db
      .update(productCategories)
      .set({ ...updates, updated_at: new Date() })
      .where(
        and(
          eq(productCategories.id, id),
          eq(productCategories.property_id, propertyId)
        )
      )
      .returning();

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(transformCategory(category));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update category' });
  }
}

async function deleteProductCategory(req: ProductsRequest, res: Response) {
  try {
    const propertyId = req.selectedPropertyId ?? null;
    const id = Number(req.params.id);
    if (!propertyId || !(await findCategory(id, propertyId))) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // The FKs would reject this too; check first for a readable 409.
    const [child, product] = await Promise.all([
      db.query.productCategories.findFirst({
        where: eq(productCategories.parent_id, id),
        columns: { id: true }
      }),
      db.query.products.findFirst({
        where: eq(products.category_id, id),
        columns: { id: true }
      })
    ]);
    if (child || product) {
      return res.status(409).json({
        error:
          'Category is not empty. Move or delete its subcategories and products first.'
      });
    }

    await db.delete(productCategories).where(eq(productCategories.id, id));

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

// --- Products ---

async function getProducts(req: ProductsRequest, res: Response) {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

async function getProductById(req: ProductsRequest, res: Response) {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

async function createProduct(req: ProductsRequest, res: Response) {
  try {
    const propertyId = req.selectedPropertyId ?? null;
    if (!propertyId) {
      return res.status(400).json({ error: 'No property selected' });
    }

    const { category_id, title, price, quantity, description } =
      req.body as CreateProductData;
    if (!(await findCategory(category_id, propertyId))) {
      return res.status(400).json({ error: 'Category not found' });
    }

    const [product] = await db
      .insert(products)
      .values({
        property_id: propertyId,
        category_id,
        title,
        price: price.toFixed(2),
        quantity,
        description: description ?? null
      })
      .returning();

    if (!product) {
      return res.status(500).json({ error: 'Failed to create product' });
    }

    res.status(201).json(transformProduct(product));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

async function updateProduct(req: ProductsRequest, res: Response) {
  try {
    const propertyId = req.selectedPropertyId ?? null;
    if (!propertyId) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const id = Number(req.params.id);
    const { category_id, title, price, quantity, description } = (req.body ??
      {}) as UpdateProductData;

    const updates: Partial<
      Pick<
        NewProduct,
        'category_id' | 'title' | 'price' | 'quantity' | 'description'
      >
    > = {};
    if (category_id !== undefined) {
      if (!(await findCategory(category_id, propertyId))) {
        return res.status(400).json({ error: 'Category not found' });
      }
      updates.category_id = category_id;
    }
    if (title !== undefined) updates.title = title;
    if (price !== undefined) updates.price = price.toFixed(2);
    if (quantity !== undefined) updates.quantity = quantity;
    if (description !== undefined) updates.description = description;

    const [product] = await db
      .update(products)
      .set({ ...updates, updated_at: new Date() })
      .where(and(eq(products.id, id), eq(products.property_id, propertyId)))
      .returning();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(transformProduct(product));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

async function deleteProduct(req: ProductsRequest, res: Response) {
  try {
    const propertyId = req.selectedPropertyId ?? null;
    if (!propertyId) {
      return res.status(404).json({ error: 'Product not found' });
    }

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

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
