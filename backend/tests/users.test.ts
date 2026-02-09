import request from 'supertest';

import app from '../src/app';
import {
  assignRoleToUser,
  cleanupDatabase,
  createTestProperty,
  createTestRole,
  createTestUser
} from './helpers/db-helpers';

describe('Users API', () => {
  let authToken: string;
  let adminToken: string;
  let testUserId: number;

  beforeEach(async () => {
    await cleanupDatabase();

    const { token, user } = await createTestUser({
      password: 'Password123!'
    });
    authToken = token;
    testUserId = user.id;

    const { token: aToken } = await createTestUser({
      is_admin: true,
      email: `admin-${Date.now()}@example.com`
    });
    adminToken = aToken;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('GET /api/users', () => {
    test('should get all users successfully', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('index');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('per_page');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page_count');
      expect(Array.isArray(response.body.index)).toBe(true);
      expect(response.body.index.length).toBeGreaterThanOrEqual(1);
    });

    test('should get users with pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&per_page=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.per_page).toBe(5);
    });

    test('should search users by email', async () => {
      const { user: searchUser } = await createTestUser({
        email: 'searchable@example.com',
        first_name: 'Searchable',
        last_name: 'User'
      });

      const response = await request(app)
        .get('/api/users?q=searchable')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(
        response.body.index.some(
          (u: { email: string }) => u.email === searchUser.email
        )
      ).toBe(true);
    });

    test('should search users by first_name', async () => {
      await createTestUser({
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe'
      });

      const response = await request(app)
        .get('/api/users?q=John')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(
        response.body.index.some(
          (u: { first_name: string }) => u.first_name === 'John'
        )
      ).toBe(true);
    });

    test('should search users by last_name', async () => {
      await createTestUser({
        email: 'jane.smith@example.com',
        first_name: 'Jane',
        last_name: 'Smith'
      });

      const response = await request(app)
        .get('/api/users?q=Smith')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(
        response.body.index.some(
          (u: { last_name: string }) => u.last_name === 'Smith'
        )
      ).toBe(true);
    });

    test('should sort users by email ascending', async () => {
      await createTestUser({ email: 'aaa@example.com' });
      await createTestUser({ email: 'zzz@example.com' });

      const response = await request(app)
        .get('/api/users?sort_by=email&sort_order=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const emails = response.body.index.map((u: { email: string }) => u.email);
      const sortedEmails = [...emails].sort();
      expect(emails).toEqual(sortedEmails);
    });

    test('should include user roles in response', async () => {
      const role = await createTestRole('admin');
      await assignRoleToUser(testUserId, role.id);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const currentUser = response.body.index.find(
        (u: { id: number }) => u.id === testUserId
      );
      expect(currentUser).toHaveProperty('roles');
      expect(Array.isArray(currentUser.roles)).toBe(true);
      expect(
        currentUser.roles.some((r: { name: string }) => r.name === 'admin')
      ).toBe(true);
    });

    test('should return 401 without authentication', async () => {
      await request(app).get('/api/users').expect(401);
    });
  });

  describe('GET /api/users/:id', () => {
    test('should get user by id successfully', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testUserId);
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('first_name');
      expect(response.body).toHaveProperty('last_name');
      expect(response.body).toHaveProperty('country_code');
      expect(response.body).toHaveProperty('is_admin');
      expect(response.body).toHaveProperty('roles');
    });

    test('should return user with roles', async () => {
      const role = await createTestRole('manager');
      await assignRoleToUser(testUserId, role.id);

      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.roles).toHaveLength(1);
      expect(response.body.roles[0].name).toBe('manager');
    });

    test('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/users/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('should return 401 without authentication', async () => {
      await request(app).get(`/api/users/${testUserId}`).expect(401);
    });

    test('should return 400 for invalid id parameter', async () => {
      await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PATCH /api/users/:id', () => {
    test('should update user successfully', async () => {
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name',
        country_code: 'US'
      };

      const response = await request(app)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(testUserId);
      expect(response.body.first_name).toBe('Updated');
      expect(response.body.last_name).toBe('Name');
      expect(response.body.country_code).toBe('US');
      expect(response.body.updated_at).toBeTruthy();
    });

    test('should update user roles', async () => {
      const role1 = await createTestRole('editor');
      const role2 = await createTestRole('viewer');

      const updateData = {
        role_ids: [role1.id, role2.id]
      };

      const response = await request(app)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.roles).toHaveLength(2);
      expect(
        response.body.roles.map((r: { name: string }) => r.name).sort()
      ).toEqual(['editor', 'viewer']);
    });

    test('should clear user roles when empty array provided', async () => {
      const role = await createTestRole('temp-role');
      await assignRoleToUser(testUserId, role.id);

      const updateData = {
        role_ids: []
      };

      const response = await request(app)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.roles).toHaveLength(0);
    });

    test('should update is_admin flag', async () => {
      const updateData = {
        is_admin: true
      };

      const response = await request(app)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.is_admin).toBe(true);
    });

    test('should return 404 for non-existent user', async () => {
      const updateData = {
        first_name: 'Updated'
      };

      await request(app)
        .patch('/api/users/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });

    test('should return 401 without authentication', async () => {
      const updateData = {
        first_name: 'Updated'
      };

      await request(app)
        .patch(`/api/users/${testUserId}`)
        .send(updateData)
        .expect(401);
    });

    test('should validate email format', async () => {
      const updateData = {
        email: 'invalid-email'
      };

      await request(app)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });

    test('should validate country_code length', async () => {
      const updateData = {
        country_code: 'USA' // should be 2 characters
      };

      await request(app)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('should delete user successfully', async () => {
      const { user: userToDelete } = await createTestUser({
        email: 'to-delete@example.com'
      });

      const response = await request(app)
        .delete(`/api/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(userToDelete.id);

      // Verify user is actually deleted
      await request(app)
        .get(`/api/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    test('should cascade delete user_roles', async () => {
      const { user: userToDelete } = await createTestUser({
        email: 'cascade-test@example.com'
      });
      const role = await createTestRole('cascade-test-role');
      await assignRoleToUser(userToDelete.id, role.id);

      await request(app)
        .delete(`/api/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // User should be deleted
      await request(app)
        .get(`/api/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    test('should return 404 for non-existent user', async () => {
      await request(app)
        .delete('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    test('should return 401 without authentication', async () => {
      await request(app).delete(`/api/users/${testUserId}`).expect(401);
    });
  });

  describe('PATCH /api/users/me/selected-property', () => {
    test('should update selected property successfully', async () => {
      const property = await createTestProperty({ name: 'Test Hotel' });

      const response = await request(app)
        .patch('/api/users/me/selected-property')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ selected_property_id: property.id })
        .expect(200);

      expect(response.body.selected_property_id).toBe(property.id);
      expect(response.body.id).toBe(testUserId);
    });

    test('should clear selected property when null is provided', async () => {
      const property = await createTestProperty({ name: 'Test Hotel' });

      // First set a property
      await request(app)
        .patch('/api/users/me/selected-property')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ selected_property_id: property.id })
        .expect(200);

      // Then clear it
      const response = await request(app)
        .patch('/api/users/me/selected-property')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ selected_property_id: null })
        .expect(200);

      expect(response.body.selected_property_id).toBeNull();
    });

    test('should not expose password in response', async () => {
      const property = await createTestProperty({ name: 'Test Hotel' });

      const response = await request(app)
        .patch('/api/users/me/selected-property')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ selected_property_id: property.id })
        .expect(200);

      expect(response.body).not.toHaveProperty('password');
    });

    test('should return 401 without authentication', async () => {
      const property = await createTestProperty({ name: 'Test Hotel' });

      await request(app)
        .patch('/api/users/me/selected-property')
        .send({ selected_property_id: property.id })
        .expect(401);
    });

    test('should update the updated_at timestamp', async () => {
      const property = await createTestProperty({ name: 'Test Hotel' });

      const response = await request(app)
        .patch('/api/users/me/selected-property')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ selected_property_id: property.id })
        .expect(200);

      expect(response.body.updated_at).toBeTruthy();
    });

    test('should return 400 for non-existent property', async () => {
      const nonExistentPropertyId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .patch('/api/users/me/selected-property')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ selected_property_id: nonExistentPropertyId })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Property not found');
    });

    test('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .patch('/api/users/me/selected-property')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ selected_property_id: 'invalid-uuid' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty search results', async () => {
      const response = await request(app)
        .get('/api/users?q=NONEXISTENTUSER12345')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    test('should handle large page numbers gracefully', async () => {
      const response = await request(app)
        .get('/api/users?page=1000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index).toHaveLength(0);
      expect(response.body.page).toBe(1000);
    });

    test('should handle multiple roles for a user', async () => {
      const role1 = await createTestRole('role1');
      const role2 = await createTestRole('role2');
      const role3 = await createTestRole('role3');

      await assignRoleToUser(testUserId, role1.id);
      await assignRoleToUser(testUserId, role2.id);
      await assignRoleToUser(testUserId, role3.id);

      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.roles).toHaveLength(3);
    });

    test('should not expose password in response', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).not.toHaveProperty('password');
    });
  });
});
