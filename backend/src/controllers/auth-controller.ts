import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { db } from '../db/pool';
import { users } from '../db/schema';
import { generateToken } from '../utils/jwt';

async function register(req: Request, res: Response) {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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
        created_at: users.created_at
      });

    // Generate JWT Token
    const token = await generateToken({
      id: String(newUser.id),
      email: newUser.email,
      first_name: newUser.first_name || '',
      last_name: newUser.last_name || ''
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
    const { email, password } = req.body;

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT
    const token = await generateToken({
      id: String(user.id),
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || ''
    });

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
