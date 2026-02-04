import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import app from '../src/app';

import { db } from '../src/db/pool';
import { roles } from '../src/db/schema';
import { cleanupDatabase, createTestUser } from './helpers/dbHelpers';

describe('Roles API', () => {
  let authToken: string;

  beforeAll(async () => {
    await cleanupDatabase();
    const { token } = await createTestUser();
    authToken = token;

    await db
      .insert(roles)
      .values([
        { name: 'Administrators' },
        { name: 'Roomservice Manager' },
        { name: 'Housekeeping Manager' },
        { name: 'Roomservice Order Agent' },
        { name: 'Housekeeping Agent' },
        { name: 'Tester' }
      ]);
  });

  describe('GET /api/roles', () => {
    it('should return a list of roles', async () => {
      const response = await request(app)
        .get('/api/roles')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const roles = response.body;
      const expectedRoles = [
        'Administrators',
        'Roomservice Manager',
        'Housekeeping Manager',
        'Roomservice Order Agent',
        'Housekeeping Agent',
        'Tester'
      ];

      // Check if all expected roles are present
      for (const roleName of expectedRoles) {
        const role = roles.find((r: any) => r.name === roleName);
        expect(role).toBeDefined();
        expect(role.id).toBeTypeOf('number');
      }
    });
  });
});
