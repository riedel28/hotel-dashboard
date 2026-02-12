import request from 'supertest';

import app from '../src/app';
import { db } from '../src/db/pool';
import {
  properties as propertiesTable,
  rooms as roomsTable
} from '../src/db/schema';
import { cleanupDatabase, createTestUser } from './helpers/db-helpers';

describe('Rooms API', () => {
  let authToken: string;
  let propertyId: string;
  let propertyId2: string;

  beforeEach(async () => {
    // Clean up first to ensure a clean slate (order matters for foreign keys)
    await cleanupDatabase();

    // Create test user
    const { token } = await createTestUser({
      password: 'Password123!'
    });
    authToken = token;

    // Create test properties
    const [property1, property2] = await db
      .insert(propertiesTable)
      .values([
        { name: 'Test Property 1', stage: 'demo' },
        { name: 'Test Property 2', stage: 'production' }
      ])
      .returning();

    propertyId = property1.id;
    propertyId2 = property2.id;

    // Create test rooms
    await db.insert(roomsTable).values([
      {
        name: 'Deluxe Suite',
        property_id: propertyId,
        room_number: '101',
        room_type: 'Suite',
        status: 'available'
      },
      {
        name: 'Standard Room',
        property_id: propertyId,
        room_number: '102',
        room_type: 'Standard',
        status: 'occupied'
      },
      {
        name: 'Executive Room',
        property_id: propertyId,
        room_number: '201',
        room_type: 'Executive',
        status: 'available'
      },
      {
        name: 'Maintenance Room',
        property_id: propertyId,
        room_number: '301',
        room_type: 'Standard',
        status: 'maintenance'
      },
      {
        name: 'Out of Order Room',
        property_id: propertyId,
        room_number: '401',
        room_type: 'Standard',
        status: 'out_of_order'
      },
      {
        name: 'Property 2 Room',
        property_id: propertyId2,
        room_number: '501',
        room_type: 'Deluxe',
        status: 'available'
      },
      {
        name: 'Another Suite',
        property_id: propertyId,
        room_number: '202',
        room_type: 'Suite',
        status: 'available'
      },
      {
        name: 'Basic Room',
        property_id: propertyId,
        room_number: '103',
        room_type: 'Basic',
        status: 'occupied'
      },
      {
        name: 'Premium Suite',
        property_id: propertyId,
        room_number: '203',
        room_type: 'Suite',
        status: 'available'
      },
      {
        name: 'Economy Room',
        property_id: propertyId,
        room_number: '104',
        room_type: 'Economy',
        status: 'available'
      },
      {
        name: 'Luxury Suite',
        property_id: propertyId,
        room_number: '204',
        room_type: 'Suite',
        status: 'occupied'
      }
    ]);
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('GET /api/rooms', () => {
    test('should get all rooms successfully with default pagination', async () => {
      const response = await request(app)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('index');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('per_page');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page_count');
      expect(response.body.page).toBe(1);
      expect(response.body.per_page).toBe(10);
      expect(response.body.total).toBe(11);
      expect(response.body.page_count).toBe(2);
      expect(Array.isArray(response.body.index)).toBe(true);
      expect(response.body.index.length).toBe(10);

      // Verify room structure
      const room = response.body.index[0];
      expect(room).toHaveProperty('id');
      expect(room).toHaveProperty('name');
      expect(room).toHaveProperty('property_id');
      expect(room).toHaveProperty('room_number');
      expect(room).toHaveProperty('room_type');
      expect(room).toHaveProperty('status');
      expect([
        'available',
        'occupied',
        'maintenance',
        'out_of_order'
      ]).toContain(room.status);
    });

    test('should return paginated results', async () => {
      const response = await request(app)
        .get('/api/rooms?page=1&per_page=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.per_page).toBe(5);
      expect(response.body.total).toBe(11);
      expect(response.body.page_count).toBe(3);
      expect(response.body.index.length).toBe(5);
    });

    test('should return second page correctly', async () => {
      const response = await request(app)
        .get('/api/rooms?page=2&per_page=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(2);
      expect(response.body.per_page).toBe(5);
      expect(response.body.total).toBe(11);
      expect(response.body.page_count).toBe(3);
      expect(response.body.index.length).toBe(5);
    });

    test('should return empty array for page beyond available data', async () => {
      const response = await request(app)
        .get('/api/rooms?page=10&per_page=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(10);
      expect(response.body.per_page).toBe(5);
      expect(response.body.total).toBe(11);
      expect(response.body.page_count).toBe(3);
      expect(response.body.index.length).toBe(0);
    });

    test('should filter rooms by search query (name)', async () => {
      const response = await request(app)
        .get('/api/rooms?q=Suite')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total).toBeGreaterThan(0);
      expect(
        response.body.index.every((room: { name: string }) =>
          room.name.includes('Suite')
        )
      ).toBe(true);
    });

    test('should filter rooms by search query (room_number)', async () => {
      const response = await request(app)
        .get('/api/rooms?q=101')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.index[0].room_number).toBe('101');
    });

    test('should filter rooms by search query (room_type)', async () => {
      const response = await request(app)
        .get('/api/rooms?q=Standard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total).toBeGreaterThan(0);
      expect(
        response.body.index.every((room: { room_type: string }) =>
          room.room_type?.includes('Standard')
        )
      ).toBe(true);
    });

    test('should return empty results for non-matching search query', async () => {
      const response = await request(app)
        .get('/api/rooms?q=NonexistentRoom123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total).toBe(0);
      expect(response.body.index.length).toBe(0);
    });

    test('should filter rooms by property_id', async () => {
      const response = await request(app)
        .get(`/api/rooms?property_id=${propertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total).toBe(10);
      expect(
        response.body.index.every(
          (room: { property_id: string }) => room.property_id === propertyId
        )
      ).toBe(true);
    });

    test('should filter rooms by property_id (different property)', async () => {
      const response = await request(app)
        .get(`/api/rooms?property_id=${propertyId2}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.index[0].property_id).toBe(propertyId2);
    });

    test('should filter rooms by status', async () => {
      const response = await request(app)
        .get('/api/rooms?status=available')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total).toBeGreaterThan(0);
      expect(
        response.body.index.every(
          (room: { status: string }) => room.status === 'available'
        )
      ).toBe(true);
    });

    test('should filter rooms by status (occupied)', async () => {
      const response = await request(app)
        .get('/api/rooms?status=occupied')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total).toBe(3);
      expect(
        response.body.index.every(
          (room: { status: string }) => room.status === 'occupied'
        )
      ).toBe(true);
    });

    test('should filter rooms by status (maintenance)', async () => {
      const response = await request(app)
        .get('/api/rooms?status=maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.index[0].status).toBe('maintenance');
    });

    test('should combine pagination and search', async () => {
      const response = await request(app)
        .get('/api/rooms?q=Suite&page=1&per_page=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index.length).toBeLessThanOrEqual(5);
      expect(
        response.body.index.every((room: { name: string }) =>
          room.name.includes('Suite')
        )
      ).toBe(true);
    });

    test('should combine property_id and status filters', async () => {
      const response = await request(app)
        .get(`/api/rooms?property_id=${propertyId}&status=available`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total).toBeGreaterThan(0);
      expect(
        response.body.index.every(
          (room: { property_id: string; status: string }) =>
            room.property_id === propertyId && room.status === 'available'
        )
      ).toBe(true);
    });

    test('should combine search, property_id, and status filters', async () => {
      const response = await request(app)
        .get(
          `/api/rooms?q=Suite&property_id=${propertyId}&status=available&page=1&per_page=5`
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index.length).toBeLessThanOrEqual(5);
      expect(
        response.body.index.every(
          (room: { name: string; property_id: string; status: string }) =>
            room.name.includes('Suite') &&
            room.property_id === propertyId &&
            room.status === 'available'
        )
      ).toBe(true);
    });

    test('should return 401 without authentication', async () => {
      await request(app).get('/api/rooms').expect(401);
    });

    test('should return 400 for invalid per_page value', async () => {
      await request(app)
        .get('/api/rooms?per_page=3')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    test('should return 400 for invalid page value', async () => {
      await request(app)
        .get('/api/rooms?page=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    test('should return 400 for invalid status value', async () => {
      await request(app)
        .get('/api/rooms?status=invalid_status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    test('should accept valid per_page values', async () => {
      const validPerPageValues = [5, 10, 25, 50, 100];

      for (const perPage of validPerPageValues) {
        const response = await request(app)
          .get(`/api/rooms?per_page=${perPage}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.per_page).toBe(perPage);
      }
    });

    test('should accept valid status values', async () => {
      const validStatusValues = [
        'available',
        'occupied',
        'maintenance',
        'out_of_order'
      ];

      for (const status of validStatusValues) {
        const response = await request(app)
          .get(`/api/rooms?status=${status}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(
          response.body.index.every(
            (room: { status: string }) => room.status === status
          )
        ).toBe(true);
      }
    });
  });

  describe('POST /api/rooms', () => {
    let adminToken: string;

    beforeEach(async () => {
      const { token } = await createTestUser({
        password: 'Password123!',
        is_admin: true
      });
      adminToken = token;
    });

    test('should create a room with valid data', async () => {
      const newRoom = {
        name: 'New Test Room',
        property_id: propertyId,
        room_number: '999',
        room_type: 'Deluxe',
        status: 'available'
      };

      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newRoom)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('New Test Room');
      expect(response.body.property_id).toBe(propertyId);
      expect(response.body.room_number).toBe('999');
      expect(response.body.room_type).toBe('Deluxe');
      expect(response.body.status).toBe('available');
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('updated_at');
    });

    test('should create a room with only required fields', async () => {
      const newRoom = {
        name: 'Minimal Room',
        property_id: propertyId
      };

      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newRoom)
        .expect(201);

      expect(response.body.name).toBe('Minimal Room');
      expect(response.body.property_id).toBe(propertyId);
      expect(response.body.room_number).toBeNull();
      expect(response.body.room_type).toBeNull();
      expect(response.body.status).toBe('available');
    });

    test('should return the created room in the rooms list', async () => {
      const newRoom = {
        name: 'Findable Room',
        property_id: propertyId,
        room_number: '777'
      };

      await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newRoom)
        .expect(201);

      const listResponse = await request(app)
        .get('/api/rooms?q=Findable')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(listResponse.body.total).toBe(1);
      expect(listResponse.body.index[0].name).toBe('Findable Room');
    });

    test('should return 400 when property_id is missing', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'No Property Room' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 when property_id is empty string', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Bad Property Room', property_id: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ property_id: propertyId })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 403 for non-admin users', async () => {
      await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Unauthorized Room',
          property_id: propertyId
        })
        .expect(403);
    });

    test('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/rooms')
        .send({
          name: 'Unauthenticated Room',
          property_id: propertyId
        })
        .expect(401);
    });
  });

  describe('GET /api/rooms/:id', () => {
    let roomId: number;

    beforeEach(async () => {
      const response = await request(app)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      roomId = response.body.index[0].id;
    });

    test('should return a single room by ID', async () => {
      const response = await request(app)
        .get(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(roomId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('property_id');
      expect(response.body).toHaveProperty('room_number');
      expect(response.body).toHaveProperty('room_type');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('updated_at');
    });

    test('should return 404 for non-existent room', async () => {
      await request(app)
        .get('/api/rooms/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('should return 401 without authentication', async () => {
      await request(app).get(`/api/rooms/${roomId}`).expect(401);
    });

    test('should return 400 for invalid ID parameter', async () => {
      await request(app)
        .get('/api/rooms/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PATCH /api/rooms/:id', () => {
    let adminToken: string;
    let roomId: number;

    beforeEach(async () => {
      const { token } = await createTestUser({
        password: 'Password123!',
        is_admin: true
      });
      adminToken = token;

      const createResponse = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Room To Update',
          property_id: propertyId,
          room_number: '500',
          room_type: 'Standard',
          status: 'available'
        })
        .expect(201);

      roomId = createResponse.body.id;
    });

    test('should update room name successfully', async () => {
      const response = await request(app)
        .patch(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Room Name' })
        .expect(200);

      expect(response.body.id).toBe(roomId);
      expect(response.body.name).toBe('Updated Room Name');
      expect(response.body.room_number).toBe('500');
      expect(response.body.updated_at).toBeTruthy();
    });

    test('should update room status', async () => {
      const response = await request(app)
        .patch(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'maintenance' })
        .expect(200);

      expect(response.body.id).toBe(roomId);
      expect(response.body.status).toBe('maintenance');
    });

    test('should update multiple fields at once', async () => {
      const response = await request(app)
        .patch(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Fully Updated Room',
          room_number: '600',
          room_type: 'Suite',
          status: 'occupied'
        })
        .expect(200);

      expect(response.body.name).toBe('Fully Updated Room');
      expect(response.body.room_number).toBe('600');
      expect(response.body.room_type).toBe('Suite');
      expect(response.body.status).toBe('occupied');
    });

    test('should return 404 for non-existent room', async () => {
      await request(app)
        .patch('/api/rooms/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Ghost Room' })
        .expect(404);
    });

    test('should return 401 without authentication', async () => {
      await request(app)
        .patch(`/api/rooms/${roomId}`)
        .send({ name: 'No Auth' })
        .expect(401);
    });

    test('should return 403 for non-admin users', async () => {
      await request(app)
        .patch(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Non Admin Update' })
        .expect(403);
    });

    test('should return 400 for invalid status value', async () => {
      await request(app)
        .patch(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);
    });
  });

  describe('DELETE /api/rooms/:id', () => {
    let adminToken: string;
    let roomId: number;

    beforeEach(async () => {
      const { token } = await createTestUser({
        password: 'Password123!',
        is_admin: true
      });
      adminToken = token;

      const createResponse = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Room To Delete',
          property_id: propertyId,
          room_number: '900',
          room_type: 'Standard',
          status: 'available'
        })
        .expect(201);

      roomId = createResponse.body.id;
    });

    test('should delete room successfully', async () => {
      const response = await request(app)
        .delete(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('should verify room is gone after deletion', async () => {
      await request(app)
        .delete(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app)
        .get(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    test('should return 404 for non-existent room', async () => {
      await request(app)
        .delete('/api/rooms/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    test('should return 401 without authentication', async () => {
      await request(app).delete(`/api/rooms/${roomId}`).expect(401);
    });

    test('should return 403 for non-admin users', async () => {
      await request(app)
        .delete(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });
});
