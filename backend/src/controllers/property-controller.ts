import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { db } from '../db/pool';
import { properties as propertiesTable } from '../db/schema';
import { escapeLikePattern } from '../utils/sql';

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

    if (stage && stage !== 'all') {
      conditions.push(eq(propertiesTable.stage, stage as string));
    }

    if (country_code && country_code !== 'all') {
      conditions.push(eq(propertiesTable.country_code, country_code as string));
    }

    const searchCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const pageNum = Number(page) || 1;
    const perPageNum = Number(per_page) || 10;
    const offset = (pageNum - 1) * perPageNum;

    // Build dynamic orderBy clause
    const sortColumn = sort_by as 'name' | 'country_code' | 'stage' | undefined;
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
      }
      orderByClause =
        sortDirection === 'desc' ? desc(orderByColumn) : asc(orderByColumn);
    }

    // Get paginated properties
    const query = db
      .select()
      .from(propertiesTable)
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
    const transformedProperties = properties.map((property) => ({
      id: property.id,
      name: property.name,
      country_code: property.country_code,
      stage: property.stage
    }));

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

    const property = await db.query.properties.findFirst({
      where: eq(propertiesTable.id, id)
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.status(200).json({
      id: property.id,
      name: property.name,
      country_code: property.country_code,
      stage: property.stage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
}

async function updateProperty(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, country_code, stage } = req.body ?? {};

    const updates = Object.fromEntries(
      Object.entries({ name, country_code, stage }).filter(
        ([, v]) => v !== undefined
      )
    );

    const [updatedProperty] = await db
      .update(propertiesTable)
      .set(updates)
      .where(eq(propertiesTable.id, id))
      .returning();

    if (!updatedProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.status(200).json({
      id: updatedProperty.id,
      name: updatedProperty.name,
      country_code: updatedProperty.country_code,
      stage: updatedProperty.stage
    });
  } catch (error) {
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
    const { name, country_code, stage } = req.body;

    const [created] = await db
      .insert(propertiesTable)
      .values({ name, country_code, stage })
      .returning();

    res.status(201).json({
      id: created.id,
      name: created.name,
      country_code: created.country_code,
      stage: created.stage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create property' });
  }
}

export {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
};
