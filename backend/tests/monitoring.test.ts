import request from 'supertest';
import app from '../src/app';
import { db } from '../src/db/pool';
import { monitoringLogs } from '../src/db/schema';
import { cleanupDatabase, createTestUser } from './helpers/dbHelpers';

describe('Monitoring API', () => {
  let authToken: string;

  beforeEach(async () => {
    await cleanupDatabase();
    const { token } = await createTestUser({
      password: 'Password123!'
    });
    authToken = token;

    // Insert some test data
    await db.insert(monitoringLogs).values([
      {
        status: 'success',
        logged_at: new Date('2024-01-01T10:00:00Z'),
        type: 'pms',
        booking_nr: 'BK-001',
        event: 'System Status',
        sub: 'PMS Connection',
        log_message: 'Success message 1'
      },
      {
        status: 'error',
        logged_at: new Date('2024-01-01T11:00:00Z'),
        type: 'door lock',
        booking_nr: 'BK-002',
        event: 'Checkout Booking',
        sub: 'Key Card',
        log_message: 'Error message 2'
      },
      {
        status: 'success',
        logged_at: new Date('2024-01-01T12:00:00Z'),
        type: 'payment',
        booking_nr: 'BK-003',
        event: 'Fetch Booking',
        sub: 'Payment Gateway',
        log_message: 'Success message 3'
      }
    ]);
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('GET /api/monitoring', () => {
    test('should get all monitoring logs successfully', async () => {
      const response = await request(app)
        .get('/api/monitoring')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('index');
      expect(response.body.index).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(response.body.page).toBe(1);
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/monitoring?page=1&per_page=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.per_page).toBe(5);
    });

    test('should filter by status', async () => {
      const response = await request(app)
        .get('/api/monitoring?status=error')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index).toHaveLength(1);
      expect(response.body.index[0].status).toBe('error');
    });

    test('should filter by type', async () => {
      const response = await request(app)
        .get('/api/monitoring?type=pms')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index).toHaveLength(1);
      expect(response.body.index[0].type).toBe('pms');
    });

    test('should search by booking number', async () => {
      const response = await request(app)
        .get('/api/monitoring?q=BK-001')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index).toHaveLength(1);
      expect(response.body.index[0].booking_nr).toBe('BK-001');
    });

    test('should search by log message', async () => {
      const response = await request(app)
        .get('/api/monitoring?q=Error message')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index).toHaveLength(1);
      expect(response.body.index[0].log_message).toContain('Error message');
    });

    test('should filter by date range', async () => {
      const from = '2024-01-01T10:30:00Z';
      const to = '2024-01-01T11:30:00Z';
      const response = await request(app)
        .get(`/api/monitoring?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index).toHaveLength(1);
      expect(response.body.index[0].booking_nr).toBe('BK-002');
    });

    test('should sort by date descending by default', async () => {
      const response = await request(app)
        .get('/api/monitoring')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const dates = response.body.index.map((log: { logged_at: string }) =>
        new Date(log.logged_at).getTime()
      );
      expect(dates[0]).toBeGreaterThan(dates[1]);
      expect(dates[1]).toBeGreaterThan(dates[2]);
    });

    test('should return 401 without authentication', async () => {
      await request(app).get('/api/monitoring').expect(401);
    });

    test('should return 400 for invalid query parameters', async () => {
      await request(app)
        .get('/api/monitoring?per_page=13') // per_page must be one of [5, 10, 25, 50, 100]
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});
