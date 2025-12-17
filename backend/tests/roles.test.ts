import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../src/app';

import { db } from '../src/db/pool';
import { roles } from '../src/db/schema';

describe('Roles API', () => {
  beforeAll(async () => {
    await db.insert(roles).values([
      { id: 1, name: 'Administrators' },
      { id: 2, name: 'Roomservice Manager' },
      { id: 3, name: 'Housekeeping Manager' },
      { id: 4, name: 'Roomservice Order Agent' },
      { id: 5, name: 'Housekeeping Agent' },
      { id: 6, name: 'Tester' }
    ]);
  });

  describe('GET /api/roles', () => {
    it('should return a list of roles', async () => {
      const response = await request(app).get('/api/roles');

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
