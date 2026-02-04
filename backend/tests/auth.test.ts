import { eq } from 'drizzle-orm';
import request from 'supertest';
import app from '../src/app';
import { db } from '../src/db/pool';
import { users } from '../src/db/schema';
import {
  cleanupDatabase,
  createTestProperty,
  createTestUser
} from './helpers/dbHelpers';

describe('Auth API', () => {
  // Clean up before and after each test to ensure isolation
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('POST /auth/register', () => {
    test('should register a new user successfully', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const userData = {
        email: uniqueEmail,
        password: 'Password123!',
        first_name: 'John',
        last_name: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.first_name).toBe(userData.first_name);
      expect(response.body.user.last_name).toBe(userData.last_name);
      expect(response.body.user).not.toHaveProperty('password');
      expect(typeof response.body.token).toBe('string');
    });

    test('should return 400 for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123!',
        first_name: 'John',
        last_name: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for short password', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const userData = {
        email: uniqueEmail,
        password: '123',
        first_name: 'John',
        last_name: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for missing required fields', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const userData = {
        email: uniqueEmail,
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/login', () => {
    test('should login with valid credentials', async () => {
      const { user, rawPassword } = await createTestUser({
        password: 'Password123!'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: rawPassword
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(user.email);
      expect(typeof response.body.token).toBe('string');
    });

    test('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should return 401 for invalid password', async () => {
      const { user } = await createTestUser({
        password: 'Password123!'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123!'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should include selected_property_id in login response', async () => {
      const property = await createTestProperty({ name: 'Login Test Hotel' });
      const { user, rawPassword } = await createTestUser({
        password: 'Password123!'
      });

      // Set selected property for the user
      await db
        .update(users)
        .set({ selected_property_id: property.id })
        .where(eq(users.id, user.id));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: rawPassword
        })
        .expect(200);

      expect(response.body.user).toHaveProperty('selected_property_id');
      expect(response.body.user.selected_property_id).toBe(property.id);
    });

    test('should return null selected_property_id when not set', async () => {
      const { user, rawPassword } = await createTestUser({
        password: 'Password123!'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: rawPassword
        })
        .expect(200);

      expect(response.body.user).toHaveProperty('selected_property_id');
      expect(response.body.user.selected_property_id).toBeNull();
    });

    test('should not expose password in login response', async () => {
      const { user, rawPassword } = await createTestUser({
        password: 'Password123!'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: rawPassword
        })
        .expect(200);

      expect(response.body.user).not.toHaveProperty('password');
    });
  });

  describe('POST /auth/register - selected_property_id', () => {
    test('should include selected_property_id (null) in register response', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const userData = {
        email: uniqueEmail,
        password: 'Password123!',
        first_name: 'John',
        last_name: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user).toHaveProperty('selected_property_id');
      expect(response.body.user.selected_property_id).toBeNull();
    });
  });
});
