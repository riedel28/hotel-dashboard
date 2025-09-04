import { db } from '../db/pool';
import { guests, reservations } from '../db/schema';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Step 1: Clear existing data (order matters!)
    console.log('Clearing existing data...');
    await db.delete(guests); // Delete guests first (foreign keys)
    await db.delete(reservations); // Delete reservations

    // Step 2: Create sample reservations
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

    // Step 4: Test relational queries
    console.log('\n🔍 Testing relational queries...');
    const reservationsWithGuests = await db.query.reservations.findMany({
      with: {
        guests: true
      }
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Seed Summary:');
    console.log(`- Created ${reservationsWithGuests.length} reservations`);
    console.log(
      `- Total guests: ${reservationsWithGuests.reduce((sum, res) => sum + res.guests.length, 0)}`
    );
    console.log('\n🏨 Sample Reservations:');
    reservationsWithGuests.forEach((res) => {
      console.log(
        `- ${res.booking_nr}: ${res.primary_guest_name} (${res.state}) - ${res.guests.length} guest(s)`
      );
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
