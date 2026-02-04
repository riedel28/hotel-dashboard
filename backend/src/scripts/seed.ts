import { db } from '../db/pool';
import {
  guests,
  monitoringLogs,
  properties,
  reservations,
  roles,
  rooms,
  userRoles,
  users
} from '../db/schema';
import { hashPassword } from '../utils/password';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (order matters due to foreign keys!)
    console.log('Clearing existing data...');
    await db.delete(guests);
    await db.delete(userRoles);
    await db.delete(monitoringLogs);
    await db.delete(reservations);
    await db.delete(rooms);
    await db.delete(users);
    await db.delete(properties);
    await db.delete(roles);

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
        balance: '450.00',
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
        balance: '280.00',
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
        balance: '0.00',
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
        logged_at: new Date(),
        type: 'pms',
        booking_nr: 'RES-001',
        event: 'System Status',
        sub: 'PMS Connection',
        log_message:
          'PMS connection established successfully.\nAll systems green.'
      },
      {
        status: 'error',
        logged_at: new Date(Date.now() - 3600000), // 1 hour ago
        type: 'door lock',
        booking_nr: 'RES-002',
        event: 'Checkout Booking',
        sub: 'Key Card',
        log_message: 'Failed to invalidate key card.\nServer timeout after 30s.'
      },
      {
        status: 'success',
        logged_at: new Date(Date.now() - 7200000), // 2 hours ago
        type: 'payment',
        booking_nr: 'RES-003',
        event: 'Fetch Booking',
        sub: 'Payment Gateway',
        log_message: 'Payment processed successfully for invoice #INV-1234.'
      },
      {
        status: 'success',
        logged_at: new Date(Date.now() - 86400000), // 1 day ago
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
