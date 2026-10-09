import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql
} from 'drizzle-orm';
import type { Request, Response } from 'express';

import type { CustomerSortableColumn } from '../../../shared/types/customers';
import { db } from '../db/pool';
import {
  customers as customersTable,
  properties as propertiesTable
} from '../db/schema';
import { escapeLikePattern, isUniqueViolation } from '../utils/sql';

// How many Properties a Customer owns. Only something to sort by: the response
// carries the Properties themselves. Table-qualified by hand, because Drizzle
// drops the table name from a column inside a single-table select, which would
// compare properties.customer_id to its own id.
const propertyCount = sql<number>`(
  select count(*)::int from ${propertiesTable}
  where ${propertiesTable}.customer_id = ${customersTable}.id
)`;

/**
 * The API shape of the given Customers: each with the Properties it owns, by
 * name. One query for all of them, not one per Customer.
 */
async function toCustomerResponses(
  customers: (typeof customersTable.$inferSelect)[]
) {
  const owned = customers.length
    ? await db
        .select({
          id: propertiesTable.id,
          name: propertiesTable.name,
          country_code: propertiesTable.country_code,
          stage: propertiesTable.stage,
          customer_id: propertiesTable.customer_id
        })
        .from(propertiesTable)
        .where(
          inArray(
            propertiesTable.customer_id,
            customers.map((customer) => customer.id)
          )
        )
        .orderBy(asc(propertiesTable.name))
    : [];

  return customers.map(
    ({ created_at: _created, updated_at: _updated, ...customer }) => ({
      ...customer,
      properties: owned
        .filter((property) => property.customer_id === customer.id)
        .map(({ customer_id: _owner, ...property }) => property)
    })
  );
}

function sortColumns(sortBy: CustomerSortableColumn) {
  switch (sortBy) {
    case 'name':
      return [customersTable.last_name, customersTable.first_name];
    case 'email':
      return [customersTable.email];
    case 'city':
      return [customersTable.city];
    case 'property_count':
      return [propertyCount];
  }
}

async function getCustomers(req: Request, res: Response) {
  try {
    const { page, per_page, q, country_code, sort_by, sort_order } = req.query;

    const pattern = q ? `%${escapeLikePattern(q as string)}%` : undefined;
    const searchCondition = and(
      country_code
        ? eq(customersTable.country_code, country_code as string)
        : undefined,
      pattern &&
        or(
          ilike(customersTable.first_name, pattern),
          ilike(customersTable.last_name, pattern),
          ilike(customersTable.company_name, pattern),
          ilike(customersTable.email, pattern),
          ilike(customersTable.city, pattern)
        )
    );

    const pageNum = Number(page) || 1;
    const perPageNum = Number(per_page) || 10;

    const direction = sort_order === 'desc' ? desc : asc;
    // Newest first unless a sort is asked for; id breaks ties so pages are stable.
    const orderBy = sort_by
      ? sortColumns(sort_by as CustomerSortableColumn).map(direction)
      : [desc(customersTable.created_at)];

    const customers = await db
      .select()
      .from(customersTable)
      .where(searchCondition)
      .orderBy(...orderBy, asc(customersTable.id))
      .limit(perPageNum)
      .offset((pageNum - 1) * perPageNum);

    const [{ total }] = await db
      .select({ total: count() })
      .from(customersTable)
      .where(searchCondition);

    res.status(200).json({
      index: await toCustomerResponses(customers),
      page: pageNum,
      per_page: perPageNum,
      total,
      page_count: Math.ceil(total / perPageNum)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
}

async function getCustomerById(req: Request, res: Response) {
  try {
    const customers = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, req.params.id));

    const [customer] = await toCustomerResponses(customers);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
}

function emailTaken(res: Response) {
  return res
    .status(409)
    .json({ error: 'A customer with this email already exists' });
}

async function createCustomer(req: Request, res: Response) {
  try {
    const created = await db
      .insert(customersTable)
      .values(req.body)
      .returning();

    const [customer] = await toCustomerResponses(created);

    res.status(201).json(customer);
  } catch (error) {
    if (isUniqueViolation(error)) return emailTaken(res);
    console.error(error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
}

async function updateCustomer(req: Request, res: Response) {
  try {
    const updated = await db
      .update(customersTable)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(customersTable.id, req.params.id))
      .returning();

    const [customer] = await toCustomerResponses(updated);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (error) {
    if (isUniqueViolation(error)) return emailTaken(res);
    console.error(error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
}

export { createCustomer, getCustomerById, getCustomers, updateCustomer };
