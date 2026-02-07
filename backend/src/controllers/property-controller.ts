import { ilike } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { db } from '../db/pool';
import { properties as propertiesTable } from '../db/schema';
import { escapeLikePattern } from '../utils/sql';

async function getProperties(req: Request, res: Response) {
  try {
    const { page, per_page, q } = req.query;

    const searchCondition = q
      ? ilike(propertiesTable.name, `%${escapeLikePattern(q as string)}%`)
      : undefined;

    const pageNum = Number(page) || 1;
    const perPageNum = Number(per_page) || 10;
    const offset = (pageNum - 1) * perPageNum;

    // Get paginated properties
    const properties = await db
      .select()
      .from(propertiesTable)
      .where(searchCondition)
      .limit(perPageNum)
      .offset(offset);

    // Get total count for pagination
    const allProperties = await db
      .select({ id: propertiesTable.id })
      .from(propertiesTable)
      .where(searchCondition);
    const totalCount = allProperties.length;

    // Transform database records to match API schema (id as string)
    const transformedProperties = properties.map((property) => ({
      id: property.id,
      name: property.name,
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

export { getProperties };
