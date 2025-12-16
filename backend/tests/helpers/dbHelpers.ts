import { db } from '../../src/db/pool.ts';
import {
  guests,
  properties,
  reservations,
  users
} from '../../src/db/schema.ts';
import { generateToken } from '../../src/utils/jwt.ts';
import { hashPassword } from '../../src/utils/password.ts';

export async function createTestUser(
  userData: Partial<{
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    is_admin: boolean;
  }> = {}
) {
  const defaultData = {
    email: `test-${Date.now()}-${Math.random()}@example.com`,
    password: 'TestPassword123!',
    first_name: `Test-${Date.now()}`,
    last_name: 'User',
    is_admin: false,
    ...userData
  };

  const hashedPassword = await hashPassword(defaultData.password);
  const [user] = await db
    .insert(users)
    .values({
      ...defaultData,
      password: hashedPassword
    })
    .returning();

  const token = await generateToken({
    id: String(user.id),
    email: user.email,
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    is_admin: user.is_admin
  });

  return { user, token, rawPassword: defaultData.password };
}

export async function cleanupDatabase() {
  // Clean up in the right order due to foreign key constraints
  // guests -> reservations -> properties -> users
  await db.delete(guests);
  await db.delete(reservations);
  await db.delete(properties);
  await db.delete(users);
}
