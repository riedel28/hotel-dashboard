import { db } from '../../src/db/pool.ts';
import {
  guests,
  monitoringLogs,
  properties,
  reservations,
  roles,
  rooms,
  userRoles,
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
    country_code: string;
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

export async function createTestRole(name: string) {
  const [role] = await db.insert(roles).values({ name }).returning();
  return role;
}

export async function createTestProperty(
  propertyData: Partial<{
    name: string;
    stage: 'demo' | 'production' | 'staging' | 'template';
  }> = {}
) {
  const defaultData = {
    name: `Test Property ${Date.now()}`,
    stage: 'demo' as const,
    ...propertyData
  };

  const [property] = await db
    .insert(properties)
    .values(defaultData)
    .returning();

  return property;
}

export async function createTestRoom(
  roomData: Partial<{
    name: string;
    property_id: string;
    room_number: string;
    room_type: string;
    status: 'available' | 'occupied' | 'maintenance' | 'out_of_order';
  }> = {}
) {
  const defaultData = {
    name: `Test Room ${Date.now()}`,
    room_number: `R${Date.now()}`,
    room_type: 'Standard',
    status: 'available' as const,
    ...roomData
  };

  const [room] = await db.insert(rooms).values(defaultData).returning();

  return room;
}

export async function assignRoleToUser(userId: number, roleId: number) {
  const [userRole] = await db
    .insert(userRoles)
    .values({ user_id: userId, role_id: roleId })
    .returning();
  return userRole;
}

export async function cleanupDatabase() {
  // Clean up in the right order due to foreign key constraints
  // user_roles -> guests -> reservations -> rooms -> properties -> roles -> users
  await db.delete(userRoles);
  await db.delete(guests);
  await db.delete(monitoringLogs);
  await db.delete(reservations);
  await db.delete(rooms);
  await db.delete(properties);
  await db.delete(roles);
  await db.delete(users);
}
