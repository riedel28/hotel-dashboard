import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';

import env from '../../env';
import { db } from '../db/pool';
import { users } from '../db/schema';
import { generateToken } from '../utils/jwt';

async function register(req: Request, res: Response) {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        first_name,
        last_name
      })
      .returning({
        id: users.id,
        email: users.email,
        first_name: users.first_name,
        last_name: users.last_name,
        selected_property_id: users.selected_property_id,
        created_at: users.created_at,
        updated_at: users.updated_at,
        is_admin: users.is_admin
      });

    // Generate JWT Token
    const token = await generateToken({
      id: String(newUser.id),
      email: newUser.email,
      first_name: newUser.first_name || '',
      last_name: newUser.last_name || '',
      is_admin: newUser.is_admin
    });

    res.status(201).json({
      user: newUser,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

async function login(req: Request, res: Response) {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user — fetch only the password for comparison
    const [userPassword] = await db
      .select({ id: users.id, password: users.password })
      .from(users)
      .where(eq(users.email, email));

    if (!userPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      userPassword.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Fetch user data without password for JWT and response
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        first_name: users.first_name,
        last_name: users.last_name,
        country_code: users.country_code,
        is_admin: users.is_admin,
        selected_property_id: users.selected_property_id,
        created_at: users.created_at,
        updated_at: users.updated_at
      })
      .from(users)
      .where(eq(users.id, userPassword.id));

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT
    const token = await generateToken(
      {
        id: String(user.id),
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_admin: user.is_admin
      },
      { rememberMe: Boolean(rememberMe) }
    );

    res.status(200).json({
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
}

export { register, login };
