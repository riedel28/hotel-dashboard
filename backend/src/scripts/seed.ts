import { sql } from "drizzle-orm";

import { db } from "../db/pool";
import { guests, properties, reservations, users } from "../db/schema";
import { hashPassword } from "../utils/password";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Step 0: Create tables if they don't exist
    console.log("Creating tables if they don't exist...");

    // Drop tables if they exist (to ensure clean schema)
    await db.execute(sql`DROP TABLE IF EXISTS guests CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS reservations CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS properties CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);

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

    // Create users table
    await db.execute(sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
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

    console.log("✅ Tables created/verified");

    // Step 1: Clear existing data (order matters!)
    console.log("Clearing existing data...");
    try {
      await db.delete(guests); // Delete guests first (foreign keys)
      await db.delete(reservations); // Delete reservations
      await db.delete(properties); // Delete properties
      await db.delete(users); // Delete users
    } catch {
      console.log("Some tables may not exist yet, continuing...");
    }

    // Step 2: Create demo users
    console.log("Creating demo users...");
    const hashedPassword = await hashPassword("very_cool_password");

    await db
      .insert(users)
      .values({
        email: "cool_new_user@example.com",
        password: hashedPassword,
        first_name: "Very",
        last_name: "Cool",
      })
      .returning();

    await db
      .insert(users)
      .values({
        email: "john@example.com",
        password: hashedPassword,
        first_name: "John",
        last_name: "Doe",
      })
      .returning();

    // Step 3: Create sample reservations
    console.log("Creating demo reservations...");

    const [reservation1] = await db
      .insert(reservations)
      .values({
        state: "pending",
        booking_nr: "RES-001",
        guest_email: "john.doe@example.com",
        primary_guest_name: "John Doe",
        booking_id: "BK-12345",
        room_name: "Deluxe Suite",
        booking_from: new Date("2024-03-15"),
        booking_to: new Date("2024-03-18"),
        check_in_via: "web",
        check_out_via: "web",
        received_at: new Date(),
        page_url: "https://booking.example.com/res-001",
        balance: 450.0,
        adults: 2,
        youth: 0,
        children: 1,
        infants: 0,
        purpose: "private",
        room: "deluxe-suite-101",
      })
      .returning();

    const [reservation2] = await db
      .insert(reservations)
      .values({
        state: "started",
        booking_nr: "RES-002",
        guest_email: "jane.smith@example.com",
        primary_guest_name: "Jane Smith",
        booking_id: "BK-67890",
        room_name: "Standard Room",
        booking_from: new Date("2024-03-20"),
        booking_to: new Date("2024-03-22"),
        check_in_via: "android",
        check_out_via: "web",
        received_at: new Date(),
        last_opened_at: new Date(),
        page_url: "https://booking.example.com/res-002",
        balance: 280.0,
        adults: 1,
        youth: 1,
        children: 0,
        infants: 0,
        purpose: "business",
        room: "standard-room-205",
      })
      .returning();

    const [reservation3] = await db
      .insert(reservations)
      .values({
        state: "done",
        booking_nr: "RES-003",
        guest_email: "mike.wilson@example.com",
        primary_guest_name: "Mike Wilson",
        booking_id: "BK-11111",
        room_name: "Economy Room",
        booking_from: new Date("2024-03-10"),
        booking_to: new Date("2024-03-12"),
        check_in_via: "station",
        check_out_via: "station",
        received_at: new Date("2024-03-08"),
        last_opened_at: new Date("2024-03-11"),
        completed_at: new Date("2024-03-12"),
        page_url: "https://booking.example.com/res-003",
        balance: 0.0,
        adults: 1,
        youth: 0,
        children: 0,
        infants: 0,
        purpose: "private",
        room: "economy-room-310",
      })
      .returning();

    // Step 3: Create guests for each reservation
    console.log("Creating demo guests...");

    // Guests for reservation 1
    await db.insert(guests).values([
      {
        reservation_id: reservation1.id,
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        nationality_code: "US",
      },
      {
        reservation_id: reservation1.id,
        first_name: "Sarah",
        last_name: "Doe",
        email: "sarah.doe@example.com",
        nationality_code: "US",
      },
      {
        reservation_id: reservation1.id,
        first_name: "Emma",
        last_name: "Doe",
        email: "emma.doe@example.com",
        nationality_code: "US",
      },
    ]);

    // Guests for reservation 2
    await db.insert(guests).values([
      {
        reservation_id: reservation2.id,
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@example.com",
        nationality_code: "DE",
      },
      {
        reservation_id: reservation2.id,
        first_name: "Alex",
        last_name: "Smith",
        email: "alex.smith@example.com",
        nationality_code: "DE",
      },
    ]);

    // Guest for reservation 3
    await db.insert(guests).values([
      {
        reservation_id: reservation3.id,
        first_name: "Mike",
        last_name: "Wilson",
        email: "mike.wilson@example.com",
        nationality_code: "AT",
      },
    ]);

    // Step 4: Create demo properties
    console.log("Creating demo properties...");
    await db.insert(properties).values([
      {
        id: "9cb0e66a-9937-465d-a188-2c4c4ae2401f",
        name: "Development (2)",
        stage: "demo",
      },
      {
        id: "61eb0e32-2391-4cd3-adc3-66efe09bc0b7",
        name: "Staging",
        stage: "staging",
      },
      {
        id: "a4e1fa51-f4ce-4e45-892c-224030a00bdd",
        name: "Development 13, Adyen",
        stage: "template",
      },
      {
        id: "cc198b13-4933-43aa-977e-dcd95fa30770",
        name: "Kullturboden-Hallstadt",
        stage: "production",
      },
      {
        id: "cc198b13-4933-43aa-977e-dcd95fa30771",
        name: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae, reiciendis dolor! Tempora, animi debitis itaque nihil quidem laborum consectetur dolorem.",
        stage: "production",
      },
      {
        id: "f8a2b4c6-d8e0-4f2a-9b1c-3d5e7f9a1b2c",
        name: "Grand Hotel Vienna",
        stage: "production",
      },
      {
        id: "e7d6c5b4-a3f2-1e0d-9c8b-7a6f5e4d3c2b",
        name: "Seaside Resort Barcelona",
        stage: "staging",
      },
      {
        id: "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
        name: "Mountain Lodge Switzerland",
        stage: "demo",
      },
      {
        id: "c2d3e4f5-a6b7-8901-cdef-234567890123",
        name: "Urban Boutique Hotel Berlin",
        stage: "template",
      },
      {
        id: "d3e4f5a6-b7c8-9012-def3-456789012345",
        name: "Historic Palace Hotel Prague",
        stage: "production",
      },
    ]);

    // Step 5: Test relational queries
    console.log("\n🔍 Testing relational queries...");
    const reservationsWithGuests = await db.query.reservations.findMany({
      with: {
        guests: true,
      },
    });

    const allProperties = await db.select().from(properties);

    console.log("✅ Database seeded successfully!");
    console.log("\n📊 Seed Summary:");
    console.log(`- Created ${reservationsWithGuests.length} reservations`);
    console.log(
      `- Total guests: ${reservationsWithGuests.reduce((sum, res) => sum + res.guests.length, 0)}`
    );
    console.log(`- Created ${allProperties.length} properties`);
    console.log("\n🏨 Sample Reservations:");
    reservationsWithGuests.forEach((res) => {
      console.log(
        `- ${res.booking_nr}: ${res.primary_guest_name} (${res.state}) - ${res.guests.length} guest(s)`
      );
    });
    console.log("\n🏢 Sample Properties:");
    allProperties.forEach((prop) => {
      console.log(`- ${prop.name} (${prop.stage})`);
    });
  } catch (error) {
    console.error("❌ Seed failed:", error);
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
