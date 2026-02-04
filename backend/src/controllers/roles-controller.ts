import type { Request, Response } from 'express';
import { db } from '../db/pool';
import { roles } from '../db/schema';

export const getRoles = async (_req: Request, res: Response) => {
  try {
    const allRoles = await db.select().from(roles);
    res.json(allRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Error fetching roles' });
  }
};
