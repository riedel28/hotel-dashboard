import { sql } from 'drizzle-orm';

import { db } from '../db/pool';
import {
  guests,
  monitoringLogs,
  properties,
  reservations,
  roles,
  users
} from '../db/schema';
import { hashPassword } from '../utils/password';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Step 0: Create tables if they don't exist
    console.log("Creating tables if they don't exist...");

    // Drop tables if they exist (to ensure clean schema)
    await db.execute(sql`DROP TABLE IF EXISTS guests CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS monitoring_logs CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS reservations CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS properties CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS roles CASCADE`);

    // Create roles table
    await db.execute(sql`
      CREATE TABLE roles (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);

    // Create reservations table
    await db.execute(sql`
      CREATE TABLE reservations (
        id SERIAL PRIMARY KEY,
        state TEXT NOT NULL CHECK (state IN ('pending','started','done')),
        booking_nr TEXT,
        guest_email TEXT,
        primary_guest_name TEXT,
        booking_id TEXT,
        room_name TEXT,
        booking_from TIMESTAMPTZ,
        booking_to TIMESTAMPTZ,
        check_in_via TEXT CHECK (check_in_via IN ('android','ios','tv','station','web')),
        check_out_via TEXT CHECK (check_out_via IN ('android','ios','tv','station','web')),
        last_opened_at TIMESTAMPTZ,
        received_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ,
        page_url TEXT,
        balance DOUBLE PRECISION DEFAULT 0,
        adults INTEGER DEFAULT 0,
        youth INTEGER DEFAULT 0,
        children INTEGER DEFAULT 0,
        infants INTEGER DEFAULT 0,
        purpose TEXT DEFAULT 'private' CHECK (purpose IN ('private','business')),
        room TEXT
      )
    `);

    // Create monitoring_logs table
    await db.execute(sql`
      CREATE TABLE monitoring_logs (
        id SERIAL PRIMARY KEY,
        status TEXT NOT NULL CHECK (status IN ('success','error')),
        date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        type TEXT NOT NULL CHECK (type IN ('pms','door lock','payment')),
        booking_nr TEXT,
        event TEXT NOT NULL,
        sub TEXT,
        log_message TEXT NOT NULL
      )
    `);

    // Create users table
    await db.execute(sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE NOT NULL
      )
    `);

    // Create guests table (after reservations due to foreign key)
    await db.execute(sql`
      CREATE TABLE guests (
        id SERIAL PRIMARY KEY,
        reservation_id INTEGER NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        nationality_code TEXT NOT NULL CHECK (nationality_code IN ('DE', 'US', 'AT', 'CH')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ,
        FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
      )
    `);

    // Create properties table
    await db.execute(sql`
      CREATE TABLE properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        stage TEXT NOT NULL CHECK (stage IN ('demo', 'production', 'staging', 'template'))
      )
    `);

    console.log('✅ Tables created/verified');

    // Step 1: Clear existing data (order matters!)
    console.log('Clearing existing data...');
    try {
      await db.delete(guests); // Delete guests first (foreign keys)
      await db.delete(monitoringLogs); // Delete monitoring logs
      await db.delete(reservations); // Delete reservations
      await db.delete(properties); // Delete properties
      await db.delete(users); // Delete users
    } catch {
      console.log('Some tables may not exist yet, continuing...');
    }

    // Step 2: Create demo users
    console.log('Creating demo users...');
    const hashedPassword = await hashPassword('very_cool_password');

    await db
      .insert(users)
      .values({
        email: 'cool_new_user@example.com',
        password: hashedPassword,
        first_name: 'Very',
        last_name: 'Cool'
      })
      .returning();

    // Step 2b: Create roles
    console.log('Creating roles...');
    await db.insert(roles).values([
      { id: 1, name: 'Administrators' },
      { id: 2, name: 'Roomservice Manager' },
      { id: 3, name: 'Housekeeping Manager' },
      { id: 4, name: 'Roomservice Order Agent' },
      { id: 5, name: 'Housekeeping Agent' },
      { id: 6, name: 'Tester' }
    ]);


    await db
      .insert(users)
      .values({
        email: 'john@example.com',
        password: hashedPassword,
        first_name: 'John',
        last_name: 'Doe'
      })
      .returning();

    // Step 3: Create sample reservations
    console.log('Creating demo reservations...');

    const [reservation1] = await db
      .insert(reservations)
      .values({
        state: 'pending',
        booking_nr: 'RES-001',
        guest_email: 'john.doe@example.com',
        primary_guest_name: 'John Doe',
        booking_id: 'BK-12345',
        room_name: 'Deluxe Suite',
        booking_from: new Date('2024-03-15'),
        booking_to: new Date('2024-03-18'),
        check_in_via: 'web',
        check_out_via: 'web',
        received_at: new Date(),
        page_url: 'https://booking.example.com/res-001',
        balance: 450.0,
        adults: 2,
        youth: 0,
        children: 1,
        infants: 0,
        purpose: 'private',
        room: 'deluxe-suite-101'
      })
      .returning();

    const [reservation2] = await db
      .insert(reservations)
      .values({
        state: 'started',
        booking_nr: 'RES-002',
        guest_email: 'jane.smith@example.com',
        primary_guest_name: 'Jane Smith',
        booking_id: 'BK-67890',
        room_name: 'Standard Room',
        booking_from: new Date('2024-03-20'),
        booking_to: new Date('2024-03-22'),
        check_in_via: 'android',
        check_out_via: 'web',
        received_at: new Date(),
        last_opened_at: new Date(),
        page_url: 'https://booking.example.com/res-002',
        balance: 280.0,
        adults: 1,
        youth: 1,
        children: 0,
        infants: 0,
        purpose: 'business',
        room: 'standard-room-205'
      })
      .returning();

    const [reservation3] = await db
      .insert(reservations)
      .values({
        state: 'done',
        booking_nr: 'RES-003',
        guest_email: 'mike.wilson@example.com',
        primary_guest_name: 'Mike Wilson',
        booking_id: 'BK-11111',
        room_name: 'Economy Room',
        booking_from: new Date('2024-03-10'),
        booking_to: new Date('2024-03-12'),
        check_in_via: 'station',
        check_out_via: 'station',
        received_at: new Date('2024-03-08'),
        last_opened_at: new Date('2024-03-11'),
        completed_at: new Date('2024-03-12'),
        page_url: 'https://booking.example.com/res-003',
        balance: 0.0,
        adults: 1,
        youth: 0,
        children: 0,
        infants: 0,
        purpose: 'private',
        room: 'economy-room-310'
      })
      .returning();

    // Step 3: Create guests for each reservation
    console.log('Creating demo guests...');

    // Guests for reservation 1
    await db.insert(guests).values([
      {
        reservation_id: reservation1.id,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        nationality_code: 'US'
      },
      {
        reservation_id: reservation1.id,
        first_name: 'Sarah',
        last_name: 'Doe',
        email: 'sarah.doe@example.com',
        nationality_code: 'US'
      },
      {
        reservation_id: reservation1.id,
        first_name: 'Emma',
        last_name: 'Doe',
        email: 'emma.doe@example.com',
        nationality_code: 'US'
      }
    ]);

    // Guests for reservation 2
    await db.insert(guests).values([
      {
        reservation_id: reservation2.id,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        nationality_code: 'DE'
      },
      {
        reservation_id: reservation2.id,
        first_name: 'Alex',
        last_name: 'Smith',
        email: 'alex.smith@example.com',
        nationality_code: 'DE'
      }
    ]);

    // Guest for reservation 3
    await db.insert(guests).values([
      {
        reservation_id: reservation3.id,
        first_name: 'Mike',
        last_name: 'Wilson',
        email: 'mike.wilson@example.com',
        nationality_code: 'AT'
      }
    ]);

    // Step 4: Create demo properties
    console.log('Creating demo properties...');
    await db.insert(properties).values([
      {
        id: 'cc198b13-4933-43aa-977e-dcd95fa30770',
        name: 'Kullturboden-Hallstadt',
        stage: 'production'
      },
      {
        id: 'cc198b13-4933-43aa-977e-dcd95fa30771',
        name: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae, reiciendis dolor! Tempora, animi debitis itaque nihil quidem laborum consectetur dolorem.',
        stage: 'production'
      },
      {
        id: '3d5552bd-389e-477d-9e9c-5016ac02632b',
        name: 'Historic Palace Hotel Prague',
        stage: 'production'
      },
      {
        id: '9971ceb1-708e-4bd1-a35c-f164d4ce75c2',
        name: 'Mountain Lodge Switzerland',
        stage: 'demo'
      },
      {
        id: '2fa9cbfe-c150-4edb-9feb-325e32e80da8',
        name: 'Seaside Resort Barcelona',
        stage: 'staging'
      },
      {
        id: '85e7ebb9-3ae6-4aaf-9ab0-f3b08defa220',
        name: 'Development (2)',
        stage: 'demo'
      },
      {
        id: '30c9c7cd-8946-4079-8449-bf8ca69a226a',
        name: 'Development 13, Adyen',
        stage: 'template'
      },
      {
        id: '8f4eb429-a9df-434a-977b-eb6c1f2a72e1',
        name: 'Grand Hotel Vienna',
        stage: 'production'
      },
      {
        id: '800fec46-58b6-4878-9c79-3adfeaac714e',
        name: 'Staging',
        stage: 'staging'
      },
      {
        id: 'dc77fb2b-1d87-42f3-8b0b-9e1cf4b8f4a7',
        name: 'Urban Boutique Hotel Berlin',
        stage: 'template'
      }
    ]);

    // Step 5: Create demo monitoring logs
    console.log('Creating demo monitoring logs...');
    await db.insert(monitoringLogs).values([
      {
        status: 'success',
        date: new Date(),
        type: 'pms',
        booking_nr: 'RES-001',
        event: 'System Status',
        sub: 'PMS Connection',
        log_message: 'PMS connection established successfully.\nAll systems green.'
      },
      {
        status: 'error',
        date: new Date(Date.now() - 3600000), // 1 hour ago
        type: 'door lock',
        booking_nr: 'RES-002',
        event: 'Checkout Booking',
        sub: 'Key Card',
        log_message: 'Failed to invalidate key card.\nServer timeout after 30s.'
      },
      {
        status: 'success',
        date: new Date(Date.now() - 7200000), // 2 hours ago
        type: 'payment',
        booking_nr: 'RES-003',
        event: 'Fetch Booking',
        sub: 'Payment Gateway',
        log_message: 'Payment processed successfully for invoice #INV-1234.'
      },
      {
        status: 'success',
        date: new Date(Date.now() - 86400000), // 1 day ago
        type: 'pms',
        booking_nr: null,
        event: 'Night Audit',
        sub: 'Scheduled Task',
        log_message: 'Night audit completed for all properties.'
      }
    ]);

    // Step 6: Test relational queries
    console.log('\n🔍 Testing relational queries...');
    const reservationsWithGuests = await db.query.reservations.findMany({
      with: {
        guests: true
      }
    });

    const allProperties = await db.select().from(properties);
    const allLogs = await db.select().from(monitoringLogs);

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Seed Summary:');
    console.log(`- Created ${reservationsWithGuests.length} reservations`);
    console.log(
      `- Total guests: ${reservationsWithGuests.reduce((sum, res) => sum + res.guests.length, 0)}`
    );
    console.log(`- Created ${allProperties.length} properties`);
    console.log(`- Created ${allLogs.length} monitoring logs`);
    console.log('\n🏨 Sample Reservations:');
    reservationsWithGuests.forEach((res) => {
      console.log(
        `- ${res.booking_nr}: ${res.primary_guest_name} (${res.state}) - ${res.guests.length} guest(s)`
      );
    });
    console.log('\n🏢 Sample Properties:');
    allProperties.forEach((prop) => {
      console.log(`- ${prop.name} (${prop.stage})`);
    });
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seed;
