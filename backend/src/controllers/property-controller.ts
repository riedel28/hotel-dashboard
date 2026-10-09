import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  sql
} from 'drizzle-orm';
import type { Request, Response } from 'express';

import {
  navItemIdSchema,
  type PropertySortableColumn,
  type PropertyStage
} from '../../../shared/types/properties';
import { db } from '../db/pool';
import {
  customers as customersTable,
  properties as propertiesTable
} from '../db/schema';
import type { AuthenticatedRequest } from '../middleware/auth';
import { escapeLikePattern, isForeignKeyViolation } from '../utils/sql';

type PropertyRow = typeof propertiesTable.$inferSelect & {
  customer: Pick<
    typeof customersTable.$inferSelect,
    'id' | 'first_name' | 'last_name' | 'company_name'
  > | null;
};

// Customers are an Administrator concern: everyone else sees a Property as
// if it had none.
function toPropertyResponse(req: Request, property: PropertyRow) {
  const isAdmin = (req as AuthenticatedRequest).user?.is_admin === true;
  const customer = isAdmin ? property.customer : null;
  return {
    id: property.id,
    name: property.name,
    country_code: property.country_code,
    stage: property.stage,
    // The column is plain text[]: keep only ids still in the catalog, since
    // the client parses the response strictly.
    disabled_nav_items: navItemIdSchema.options.filter((id) =>
      property.disabled_nav_items.includes(id)
    ),
    customer_id: customer?.id ?? null,
    customer: customer && {
      id: customer.id,
      first_name: customer.first_name,
      last_name: customer.last_name,
      company_name: customer.company_name
    }
  };
}

function findProperty(id: string) {
  return db.query.properties.findFirst({
    where: eq(propertiesTable.id, id),
    with: { customer: true }
  });
}

async function getProperties(req: Request, res: Response) {
  try {
    const { page, per_page, q, stage, country_code, sort_by, sort_order } =
      req.query;

    const conditions = [];

    if (q) {
      conditions.push(
        ilike(propertiesTable.name, `%${escapeLikePattern(q as string)}%`)
      );
    }

    // Already validated and split into a list by fetchPropertiesParamsSchema.
    const stages = (stage ?? []) as PropertyStage[];
    if (stages.length > 0) {
      conditions.push(inArray(propertiesTable.stage, stages));
    }

    if (country_code) {
      conditions.push(eq(propertiesTable.country_code, country_code as string));
    }

    const searchCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const pageNum = Number(page) || 1;
    const perPageNum = Number(per_page) || 10;
    const offset = (pageNum - 1) * perPageNum;

    // Build dynamic orderBy clause
    const sortColumn = sort_by as PropertySortableColumn | undefined;
    const sortDirection = sort_order as 'asc' | 'desc' | undefined;

    let orderByClause;
    if (sortColumn) {
      let orderByColumn;
      switch (sortColumn) {
        case 'name':
          orderByColumn = propertiesTable.name;
          break;
        case 'country_code':
          orderByColumn = propertiesTable.country_code;
          break;
        case 'stage':
          orderByColumn = propertiesTable.stage;
          break;
        case 'customer':
          // Same text as customerLabel(); Properties without one sort last.
          orderByColumn = sql`coalesce(${customersTable.company_name}, ${customersTable.first_name} || ' ' || ${customersTable.last_name})`;
          break;
      }
      orderByClause =
        sortDirection === 'desc' ? desc(orderByColumn) : asc(orderByColumn);
    }

    // Get paginated properties
    const query = db
      .select({
        ...getTableColumns(propertiesTable),
        customer: {
          id: customersTable.id,
          first_name: customersTable.first_name,
          last_name: customersTable.last_name,
          company_name: customersTable.company_name
        }
      })
      .from(propertiesTable)
      .leftJoin(
        customersTable,
        eq(propertiesTable.customer_id, customersTable.id)
      )
      .where(searchCondition)
      .limit(perPageNum)
      .offset(offset);

    const properties = orderByClause
      ? await query.orderBy(orderByClause)
      : await query;

    // Get total count for pagination
    const [{ total }] = await db
      .select({ total: count() })
      .from(propertiesTable)
      .where(searchCondition);
    const totalCount = total;

    // Transform database records to match API schema (id as string)
    const transformedProperties = properties.map((property) =>
      toPropertyResponse(req, property)
    );

    res.status(200).json({
      index: transformedProperties,
      page: pageNum,
      per_page: perPageNum,
      total: totalCount,
      page_count: Math.ceil(totalCount / perPageNum)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
}

async function getPropertyById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const property = await findProperty(id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.status(200).json(toPropertyResponse(req, property));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
}

async function updateProperty(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, country_code, stage, disabled_nav_items, customer_id } =
      req.body ?? {};

    // customer_id: null unassigns the Customer, so only undefined is dropped.
    const updates = Object.fromEntries(
      Object.entries({
        name,
        country_code,
        stage,
        disabled_nav_items,
        customer_id
      }).filter(([, v]) => v !== undefined)
    );

    const [updated] = await db
      .update(propertiesTable)
      .set(updates)
      .where(eq(propertiesTable.id, id))
      .returning({ id: propertiesTable.id });

    const updatedProperty = updated && (await findProperty(updated.id));

    if (!updatedProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.status(200).json(toPropertyResponse(req, updatedProperty));
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return res.status(400).json({ error: 'Customer not found' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to update property' });
  }
}

async function deleteProperty(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const property = await db.query.properties.findFirst({
      where: eq(propertiesTable.id, id)
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    await db.delete(propertiesTable).where(eq(propertiesTable.id, id));

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
}

async function createProperty(req: Request, res: Response) {
  try {
    const { name, country_code, stage, customer_id } = req.body;

    const [created] = await db
      .insert(propertiesTable)
      .values({ name, country_code, stage, customer_id })
      .returning({ id: propertiesTable.id });

    const property = await findProperty(created.id);

    res.status(201).json(toPropertyResponse(req, property!));
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return res.status(400).json({ error: 'Customer not found' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create property' });
  }
}

export {
  createProperty,
  deleteProperty,
  getProperties,
  getPropertyById,
  updateProperty
};
