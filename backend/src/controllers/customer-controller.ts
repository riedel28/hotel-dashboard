import {
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
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

// Table-qualified by hand: Drizzle drops the table name from a column inside
// a single-table select, which would compare properties.customer_id to its own id.
const propertyCount = sql<number>`(
  select count(*)::int from ${propertiesTable}
  where ${propertiesTable}.customer_id = ${customersTable}.id
)`;

const customerColumns = {
  ...getTableColumns(customersTable),
  property_count: propertyCount
};

function toCustomerResponse(
  customer: typeof customersTable.$inferSelect & { property_count: number }
) {
  return {
    id: customer.id,
    first_name: customer.first_name,
    last_name: customer.last_name,
    company_name: customer.company_name,
    email: customer.email,
    address_line_1: customer.address_line_1,
    address_line_2: customer.address_line_2,
    zip: customer.zip,
    city: customer.city,
    country_code: customer.country_code,
    property_count: customer.property_count
  };
}

function sortColumns(sortBy: CustomerSortableColumn) {
  switch (sortBy) {
    case 'name':
      return [customersTable.last_name, customersTable.first_name];
    case 'company_name':
      return [customersTable.company_name];
    case 'email':
      return [customersTable.email];
    case 'country_code':
      return [customersTable.country_code];
    case 'property_count':
      return [propertyCount];
  }
}

async function getCustomers(req: Request, res: Response) {
  try {
    const { page, per_page, q, sort_by, sort_order } = req.query;

    const pattern = q ? `%${escapeLikePattern(q as string)}%` : undefined;
    const searchCondition = pattern
      ? or(
          ilike(customersTable.first_name, pattern),
          ilike(customersTable.last_name, pattern),
          ilike(customersTable.company_name, pattern),
          ilike(customersTable.email, pattern),
          ilike(customersTable.city, pattern)
        )
      : undefined;

    const pageNum = Number(page) || 1;
    const perPageNum = Number(per_page) || 10;

    const direction = sort_order === 'desc' ? desc : asc;
    // Newest first unless a sort is asked for; id breaks ties so pages are stable.
    const orderBy = sort_by
      ? sortColumns(sort_by as CustomerSortableColumn).map(direction)
      : [desc(customersTable.created_at)];

    const customers = await db
      .select(customerColumns)
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
      index: customers.map(toCustomerResponse),
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

async function findCustomer(id: string) {
  const [customer] = await db
    .select(customerColumns)
    .from(customersTable)
    .where(eq(customersTable.id, id));
  return customer;
}

async function getCustomerById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const customer = await findCustomer(id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const properties = await db
      .select({
        id: propertiesTable.id,
        name: propertiesTable.name,
        country_code: propertiesTable.country_code,
        stage: propertiesTable.stage
      })
      .from(propertiesTable)
      .where(eq(propertiesTable.customer_id, id))
      .orderBy(asc(propertiesTable.name));

    res.status(200).json({ ...toCustomerResponse(customer), properties });
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
    const [created] = await db
      .insert(customersTable)
      .values(req.body)
      .returning();

    res.status(201).json(toCustomerResponse({ ...created, property_count: 0 }));
  } catch (error) {
    if (isUniqueViolation(error)) return emailTaken(res);
    console.error(error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
}

async function updateCustomer(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(customersTable)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(customersTable.id, id))
      .returning({ id: customersTable.id });

    if (!updated) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json(toCustomerResponse(await findCustomer(id)));
  } catch (error) {
    if (isUniqueViolation(error)) return emailTaken(res);
    console.error(error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
}

export { createCustomer, getCustomerById, getCustomers, updateCustomer };
