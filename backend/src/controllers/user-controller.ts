import bcrypt from 'bcrypt';
import { and, asc, count, desc, eq, ilike, isNull, or } from 'drizzle-orm';
import type { Request, Response } from 'express';

import env from '../../env';
import { db } from '../db/pool';
import {
  emailVerificationTokens,
  properties,
  roles,
  userRoles,
  users
} from '../db/schema';
import type { AuthenticatedRequest } from '../middleware/auth';
import { sendInvitationEmail } from '../utils/email';
import { escapeLikePattern } from '../utils/sql';
import { generateVerificationToken } from '../utils/token';

async function getUsers(req: Request, res: Response) {
  try {
    const { page, per_page, q, sort_by, sort_order } = req.query;

    const conditions = [];

    if (q) {
      const escaped = escapeLikePattern(q as string);
      conditions.push(
        or(
          ilike(users.first_name, `%${escaped}%`),
          ilike(users.last_name, `%${escaped}%`),
          ilike(users.email, `%${escaped}%`)
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
      columns: { password: false },
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
      email_verified: user.email_verified,
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
      const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

      // Create user
      const [newUser] = await tx
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          first_name: first_name || null,
          last_name: last_name || null,
          country_code: country_code || null,
          is_admin: is_admin || false,
          email_verified: true
        })
        .returning({
          id: users.id,
          email: users.email,
          first_name: users.first_name,
          last_name: users.last_name,
          country_code: users.country_code,
          is_admin: users.is_admin,
          email_verified: users.email_verified,
          created_at: users.created_at,
          updated_at: users.updated_at
        });

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
        columns: { password: false },
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
      email_verified: userWithRoles.email_verified,
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
      columns: { password: false },
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
      email_verified: user.email_verified,
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
          .returning({
            id: users.id,
            email: users.email,
            first_name: users.first_name,
            last_name: users.last_name,
            country_code: users.country_code,
            is_admin: users.is_admin,
            created_at: users.created_at,
            updated_at: users.updated_at
          });

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
        columns: { password: false },
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
      email_verified: userWithRoles.email_verified,
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
      columns: { password: false },
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
      email_verified: user.email_verified,
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

async function updateSelectedProperty(req: Request, res: Response) {
  const authenticatedReq = req as AuthenticatedRequest;
  const userId = authenticatedReq.user?.id;
  const { selected_property_id } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    // Validate property exists if provided
    if (selected_property_id) {
      const propertyExists = await db.query.properties.findFirst({
        where: eq(properties.id, selected_property_id)
      });

      if (!propertyExists) {
        return res.status(400).json({ error: 'Property not found' });
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        selected_property_id: selected_property_id || null,
        updated_at: new Date()
      })
      .where(eq(users.id, Number(userId)))
      .returning({
        id: users.id,
        email: users.email,
        first_name: users.first_name,
        last_name: users.last_name,
        country_code: users.country_code,
        is_admin: users.is_admin,
        selected_property_id: users.selected_property_id,
        created_at: users.created_at,
        updated_at: users.updated_at
      });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Failed to update selected property:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to update selected property';
    res.status(500).json({ error: errorMessage });
  }
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

async function inviteUser(req: Request, res: Response) {
  const authenticatedReq = req as AuthenticatedRequest;
  const { email, first_name, last_name, is_admin, role_ids } = req.body;

  try {
    let invitationToken: string | undefined;

    const userWithRoles = await db.transaction(async (tx) => {
      // Check duplicate email
      const existing = await tx.query.users.findFirst({
        columns: { id: true },
        where: eq(users.email, email)
      });

      if (existing) {
        throw Object.assign(new Error('Email already registered'), {
          statusCode: 409
        });
      }

      // Create user without password
      const [newUser] = await tx
        .insert(users)
        .values({
          email,
          first_name: first_name || null,
          last_name: last_name || null,
          is_admin: is_admin || false,
          email_verified: false
        })
        .returning({ id: users.id });

      if (!newUser) {
        throw new Error('Failed to create user');
      }

      // Assign roles if provided
      if (Array.isArray(role_ids) && role_ids.length > 0) {
        const newUserRoles = role_ids.map((roleId: number) => ({
          user_id: newUser.id,
          role_id: roleId
        }));
        await tx.insert(userRoles).values(newUserRoles);
      }

      // Generate invitation token (7 day expiry)
      invitationToken = generateVerificationToken();
      await tx.insert(emailVerificationTokens).values({
        user_id: newUser.id,
        token: invitationToken,
        type: 'invitation',
        expires_at: new Date(Date.now() + SEVEN_DAYS_MS)
      });

      // Fetch the created user with roles
      return tx.query.users.findFirst({
        columns: { password: false },
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

    // Send invitation email after transaction commits
    if (invitationToken) {
      const inviterName = [
        authenticatedReq.user?.first_name,
        authenticatedReq.user?.last_name
      ]
        .filter(Boolean)
        .join(' ');
      await sendInvitationEmail(
        email,
        invitationToken,
        inviterName || undefined
      );
    }

    if (!userWithRoles) {
      return res.status(500).json({ error: 'Failed to invite user' });
    }

    const transformedUser = {
      id: userWithRoles.id,
      email: userWithRoles.email,
      first_name: userWithRoles.first_name,
      last_name: userWithRoles.last_name,
      country_code: userWithRoles.country_code,
      is_admin: userWithRoles.is_admin,
      email_verified: userWithRoles.email_verified,
      created_at: userWithRoles.created_at,
      updated_at: userWithRoles.updated_at,
      roles: userWithRoles.userRoles.map((ur) => ur.role)
    };

    res.status(201).json(transformedUser);
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    if (err.statusCode === 409) {
      return res.status(409).json({ error: err.message });
    }
    console.error('Invite user error:', error);
    res.status(500).json({ error: 'Failed to invite user' });
  }
}

async function resendInvitation(req: Request, res: Response) {
  const { id } = req.params;
  const authenticatedReq = req as AuthenticatedRequest;
  const userId = Number(id);

  try {
    const user = await db.query.users.findFirst({
      columns: { id: true, email: true, email_verified: true, password: true },
      where: eq(users.id, userId)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only resend for invited users (unverified, no password)
    if (user.email_verified || user.password) {
      return res
        .status(400)
        .json({ error: 'User is already verified or has a password set' });
    }

    // Invalidate old invitation tokens
    await db
      .update(emailVerificationTokens)
      .set({ used_at: new Date() })
      .where(
        and(
          eq(emailVerificationTokens.user_id, userId),
          eq(emailVerificationTokens.type, 'invitation'),
          isNull(emailVerificationTokens.used_at)
        )
      );

    // Create new invitation token (7 day expiry)
    const token = generateVerificationToken();
    await db.insert(emailVerificationTokens).values({
      user_id: userId,
      token,
      type: 'invitation',
      expires_at: new Date(Date.now() + SEVEN_DAYS_MS)
    });

    // Send invitation email
    const inviterName = [
      authenticatedReq.user?.first_name,
      authenticatedReq.user?.last_name
    ]
      .filter(Boolean)
      .join(' ');
    await sendInvitationEmail(user.email, token, inviterName || undefined);

    res.status(200).json({ message: 'Invitation resent successfully' });
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({ error: 'Failed to resend invitation' });
  }
}

export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateSelectedProperty,
  inviteUser,
  resendInvitation
};
