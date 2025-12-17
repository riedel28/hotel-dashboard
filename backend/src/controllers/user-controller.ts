import bcrypt from 'bcrypt';
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { db } from '../db/pool';
import { roles, userRoles, users } from '../db/schema';

async function getUsers(req: Request, res: Response) {
  try {
    const { page, per_page, q, sort_by, sort_order } = req.query;

    const conditions = [];

    if (q) {
      conditions.push(
        or(
          ilike(users.first_name, `%${q}%`),
          ilike(users.last_name, `%${q}%`),
          ilike(users.email, `%${q}%`)
        )
      );
    }

    const searchCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Build dynamic orderBy clause
    const sortColumn = sort_by as
      | 'email'
      | 'first_name'
      | 'last_name'
      | 'country_code'
      | 'is_admin'
      | 'created_at'
      | undefined;
    const sortDirection = sort_order as 'asc' | 'desc' | undefined;

    let orderByColumn;
    switch (sortColumn) {
      case 'email':
        orderByColumn = users.email;
        break;
      case 'first_name':
        orderByColumn = users.first_name;
        break;
      case 'last_name':
        orderByColumn = users.last_name;
        break;
      case 'country_code':
        orderByColumn = users.country_code;
        break;
      case 'is_admin':
        orderByColumn = users.is_admin;
        break;
      case 'created_at':
        orderByColumn = users.created_at;
        break;
      default:
        orderByColumn = users.created_at;
    }

    const orderBy =
      sortDirection === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    const usersData = await db.query.users.findMany({
      where: searchCondition,
      with: {
        userRoles: {
          with: {
            role: true
          }
        }
      },
      offset: ((Number(page) || 1) - 1) * (Number(per_page) || 10),
      limit: Number(per_page) || 10,
      orderBy
    });

    // Transform the response to flatten roles
    const transformedUsers = usersData.map((user) => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      country_code: user.country_code,
      is_admin: user.is_admin,
      created_at: user.created_at,
      updated_at: user.updated_at,
      roles: user.userRoles.map((ur) => ur.role)
    }));

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(users)
      .where(searchCondition);
    const totalCount = totalCountResult[0]?.count ?? 0;

    res.status(200).json({
      index: transformedUsers,
      page: Number(page) || 1,
      per_page: Number(per_page) || 10,
      total: totalCount,
      page_count: Math.ceil(totalCount / (Number(per_page) || 10))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

async function createUser(req: Request, res: Response) {
  const {
    email,
    password,
    first_name,
    last_name,
    country_code,
    is_admin,
    role_ids
  } = req.body;

  try {
    const userWithRoles = await db.transaction(async (tx) => {
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const [newUser] = await tx
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          first_name: first_name || null,
          last_name: last_name || null,
          country_code: country_code || null,
          is_admin: is_admin || false
        })
        .returning();

      if (!newUser) {
        return null;
      }

      // Assign roles if provided
      if (Array.isArray(role_ids) && role_ids.length > 0) {
        const newUserRoles = role_ids.map((roleId: number) => ({
          user_id: newUser.id,
          role_id: roleId
        }));
        await tx.insert(userRoles).values(newUserRoles);
      }

      // Fetch the created user with roles
      return tx.query.users.findFirst({
        where: eq(users.id, newUser.id),
        with: {
          userRoles: {
            with: {
              role: true
            }
          }
        }
      });
    });

    if (!userWithRoles) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Transform the response to flatten roles
    const transformedUser = {
      id: userWithRoles.id,
      email: userWithRoles.email,
      first_name: userWithRoles.first_name,
      last_name: userWithRoles.last_name,
      country_code: userWithRoles.country_code,
      is_admin: userWithRoles.is_admin,
      created_at: userWithRoles.created_at,
      updated_at: userWithRoles.updated_at,
      roles: userWithRoles.userRoles.map((ur) => ur.role)
    };

    res.status(201).json(transformedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

async function getUserById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(id)),
      with: {
        userRoles: {
          with: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform the response to flatten roles
    const transformedUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      country_code: user.country_code,
      is_admin: user.is_admin,
      created_at: user.created_at,
      updated_at: user.updated_at,
      roles: user.userRoles.map((ur) => ur.role)
    };

    res.status(200).json(transformedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const updates = req.body ?? {};
  const userId = Number(id);

  try {
    const userWithRoles = await db.transaction(async (tx) => {
      const { role_ids, ...userUpdates } = updates;

      // Update user fields if there are any
      if (Object.keys(userUpdates).length > 0) {
        const [updatedUser] = await tx
          .update(users)
          .set({ ...userUpdates, updated_at: new Date() })
          .where(eq(users.id, userId))
          .returning();

        if (!updatedUser) {
          return null;
        }
      }

      // Update roles if provided
      if (Array.isArray(role_ids)) {
        // Delete existing user roles
        await tx.delete(userRoles).where(eq(userRoles.user_id, userId));

        // Insert new user roles
        if (role_ids.length > 0) {
          const newUserRoles = role_ids.map((roleId: number) => ({
            user_id: userId,
            role_id: roleId
          }));
          await tx.insert(userRoles).values(newUserRoles);
        }
      }

      // Fetch the updated user with roles
      return tx.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
          userRoles: {
            with: {
              role: true
            }
          }
        }
      });
    });

    if (!userWithRoles) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform the response to flatten roles
    const transformedUser = {
      id: userWithRoles.id,
      email: userWithRoles.email,
      first_name: userWithRoles.first_name,
      last_name: userWithRoles.last_name,
      country_code: userWithRoles.country_code,
      is_admin: userWithRoles.is_admin,
      created_at: userWithRoles.created_at,
      updated_at: userWithRoles.updated_at,
      roles: userWithRoles.userRoles.map((ur) => ur.role)
    };

    res.status(200).json(transformedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;

  try {
    // First fetch the user to return it after deletion
    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(id)),
      with: {
        userRoles: {
          with: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user (user_roles will be cascade deleted due to FK constraint)
    await db.delete(users).where(eq(users.id, Number(id)));

    // Transform the response to flatten roles
    const transformedUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      country_code: user.country_code,
      is_admin: user.is_admin,
      created_at: user.created_at,
      updated_at: user.updated_at,
      roles: user.userRoles.map((ur) => ur.role)
    };

    res.status(200).json(transformedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

export { getUsers, getUserById, createUser, updateUser, deleteUser };
