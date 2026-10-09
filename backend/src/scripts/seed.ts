import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { inArray } from 'drizzle-orm';

import { deriveLetter } from '../../../shared/types/guest-abc';
import { db } from '../db/pool';
import {
  customers,
  devices,
  guestAbcEntries,
  guests,
  monitoringLogs,
  productCategories,
  products,
  properties,
  reservations,
  roles,
  rooms,
  users
} from '../db/schema';
import { truncateAllTables } from '../db/truncate-all';
import { hashPassword } from '../utils/password';

const demoLogTemplates = [
  {
    type: 'pms',
    event: 'Reservation synced',
    sub: 'PMS Connection',
    ok: 'Reservation updated from PMS.\n2 fields changed.',
    fail: 'PMS did not respond.\nServer timeout after 30s.'
  },
  {
    type: 'pms',
    event: 'Night Audit',
    sub: 'Scheduled Task',
    ok: 'Night audit completed for all properties.',
    fail: 'Night audit aborted: PMS returned HTTP 503.'
  },
  {
    type: 'door lock',
    event: 'Key issued',
    sub: 'Key Card',
    ok: 'Mobile key issued for the booked room.',
    fail: 'Failed to issue key card.\nLock controller unreachable.'
  },
  {
    type: 'door lock',
    event: 'Checkout Booking',
    sub: 'Key Card',
    ok: 'Key card invalidated on checkout.',
    fail: 'Failed to invalidate key card.\nServer timeout after 30s.'
  },
  {
    type: 'payment',
    event: 'Charge',
    sub: 'Payment Gateway',
    ok: 'Payment processed successfully for invoice #INV-1234.',
    fail: 'Card declined by issuer: insufficient funds.\nProvider: Adyen, code 51, attempt 2 of 3.'
  }
] as const;

// ~200 logs spread over the last 30 days, denser towards now, so every period
// preset and the pagination have something to show.
function buildDemoMonitoringLogs() {
  const bookingNrs = ['RES-001', 'RES-002', 'RES-003', null];
  const monthMs = 30 * 24 * 60 * 60 * 1000;

  return Array.from({ length: 200 }, (_, i) => {
    const template = demoLogTemplates[i % demoLogTemplates.length]!;
    const failed = i % 7 === 0;

    return {
      status: failed ? ('error' as const) : ('success' as const),
      logged_at: new Date(Date.now() - Math.round(monthMs * (i / 200) ** 2)),
      type: template.type,
      booking_nr: bookingNrs[i % bookingNrs.length] ?? null,
      event: template.event,
      sub: template.sub,
      log_message: failed ? template.fail : template.ok
    };
  });
}

// The Overlook Hotel — the canonical demo property. Seeded Guest ABC content
// attaches here, and demo users' selected property is pointed at it.
const OVERLOOK_HOTEL_ID = 'cc198b13-4933-43aa-977e-dcd95fa30770';

// Fixed ids, so links to a demo Customer survive a re-seed.
const CUSTOMER_IDS = {
  ullman: '5b0f6b52-6f0b-4f5e-9d0e-3a0c2f1e7a01',
  scott: '5b0f6b52-6f0b-4f5e-9d0e-3a0c2f1e7a02',
  fawlty: '5b0f6b52-6f0b-4f5e-9d0e-3a0c2f1e7a03',
  bates: '5b0f6b52-6f0b-4f5e-9d0e-3a0c2f1e7a04'
};
// PIN of every demo device, claimed or not
const DEMO_DEVICE_PIN = '123412341234';

type GuestAbcSeed = Record<string, { title: string; description: string }[]>;

// `import.meta.dir` is Bun-only and resolves to undefined under vitest, which
// imports this module transitively via src/routes/test.ts.
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

const guestAbcData: GuestAbcSeed = JSON.parse(
  fs.readFileSync(path.resolve(scriptDir, 'data/guest-abc-data.json'), 'utf-8')
);

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    console.log('Clearing existing data...');
    await truncateAllTables();

    // Step 2: Create demo users
    console.log('Creating demo users...');
    const hashedPassword = await hashPassword('very_cool_password');

    await db
      .insert(users)
      .values({
        email: 'cool_new_user@example.com',
        password: hashedPassword,
        first_name: 'Very',
        last_name: 'Cool',
        email_verified: true
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
        last_name: 'Doe',
        email_verified: true,
        is_admin: true
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

    // Step 4: Create demo customers — fewer than there are properties, so
    // some own several.
    console.log('Creating demo customers...');
    await db.insert(customers).values([
      {
        id: CUSTOMER_IDS.ullman,
        first_name: 'Stuart',
        last_name: 'Ullman',
        company_name: 'Overlook Hospitality Inc.',
        email: 'stuart.ullman@example.com',
        address_line_1: '333 Wonderview Avenue',
        zip: '80517',
        city: 'Estes Park',
        country_code: 'US'
      },
      {
        id: CUSTOMER_IDS.scott,
        first_name: 'Winston',
        last_name: 'Scott',
        company_name: 'Continental Hotels Ltd.',
        email: 'winston.scott@example.com',
        address_line_1: '1 Wall Street Court',
        address_line_2: 'Penthouse',
        zip: '10005',
        city: 'New York',
        country_code: 'US'
      },
      {
        id: CUSTOMER_IDS.fawlty,
        first_name: 'Basil',
        last_name: 'Fawlty',
        email: 'basil.fawlty@example.com',
        address_line_1: '16 Elwood Avenue',
        zip: 'TQ1 2DA',
        city: 'Torquay',
        country_code: 'GB'
      },
      {
        id: CUSTOMER_IDS.bates,
        first_name: 'Norman',
        last_name: 'Bates',
        email: 'norman.bates@example.com',
        address_line_1: '2211 Old Highway 10',
        address_line_2: 'The house on the hill',
        zip: '96020',
        city: 'Fairvale',
        country_code: 'US'
      }
    ]);

    // Step 4a: Create demo properties (famous fictional hotels)
    console.log('Creating demo properties...');
    await db.insert(properties).values([
      {
        id: 'cc198b13-4933-43aa-977e-dcd95fa30770',
        name: 'The Overlook Hotel',
        country_code: 'US',
        stage: 'production',
        customer_id: CUSTOMER_IDS.ullman
      },
      {
        id: 'cc198b13-4933-43aa-977e-dcd95fa30771',
        name: 'The Grand Budapest Hotel',
        country_code: 'HU',
        stage: 'production',
        customer_id: CUSTOMER_IDS.scott
      },
      {
        id: '3d5552bd-389e-477d-9e9c-5016ac02632b',
        name: 'The Continental',
        country_code: 'US',
        stage: 'production',
        customer_id: CUSTOMER_IDS.scott
      },
      {
        id: '9971ceb1-708e-4bd1-a35c-f164d4ce75c2',
        name: 'Fawlty Towers',
        country_code: 'GB',
        stage: 'production',
        customer_id: CUSTOMER_IDS.fawlty
      },
      {
        id: '2fa9cbfe-c150-4edb-9feb-325e32e80da8',
        name: 'Bates Motel',
        country_code: 'US',
        stage: 'production',
        customer_id: CUSTOMER_IDS.bates
      },
      {
        id: '85e7ebb9-3ae6-4aaf-9ab0-f3b08defa220',
        name: 'Hotel Transylvania',
        country_code: 'RO',
        stage: 'demo',
        customer_id: CUSTOMER_IDS.bates
      },
      {
        id: '30c9c7cd-8946-4079-8449-bf8ca69a226a',
        name: 'The White Lotus',
        country_code: 'IT',
        stage: 'staging',
        customer_id: CUSTOMER_IDS.scott
      },
      {
        id: '8f4eb429-a9df-434a-977b-eb6c1f2a72e1',
        name: "Bertram's Hotel",
        country_code: 'GB',
        stage: 'staging',
        customer_id: CUSTOMER_IDS.fawlty
      },
      {
        id: '800fec46-58b6-4878-9c79-3adfeaac714e',
        name: 'The Dolphin Hotel',
        country_code: 'US',
        stage: 'template',
        customer_id: CUSTOMER_IDS.ullman
      },
      {
        id: 'dc77fb2b-1d87-42f3-8b0b-9e1cf4b8f4a7',
        name: "Kellerman's Resort",
        country_code: 'US',
        stage: 'demo',
        customer_id: CUSTOMER_IDS.fawlty
      }
    ]);

    // Step 4b: Seed Guest ABC entries for The Overlook Hotel.
    // Letter is derived from each title (buckets are recomputed, not trusted).
    console.log('Creating demo Guest ABC entries...');
    const guestAbcRows = Object.values(guestAbcData)
      .flat()
      .map((entry) => ({
        property_id: OVERLOOK_HOTEL_ID,
        letter: deriveLetter(entry.title),
        title: entry.title,
        description: entry.description
      }));
    if (guestAbcRows.length > 0) {
      await db.insert(guestAbcEntries).values(guestAbcRows);
    }

    // Step 4c: Seed a product catalog for The Overlook Hotel — three levels
    // deep, with a free item and multi-line descriptions.
    console.log('Creating demo products...');
    type CategorySeed = {
      title: string;
      products?: {
        title: string;
        price: number;
        quantity: number;
        description?: string;
      }[];
      children?: CategorySeed[];
    };
    const catalog: CategorySeed[] = [
      {
        title: 'Mini-bar',
        children: [
          {
            title: 'Drinks',
            products: [
              {
                title: 'Still water 0.5 L',
                price: 3,
                quantity: 24,
                description: 'Local spring water, served chilled.'
              },
              { title: 'Cola 0.33 L', price: 4, quantity: 12 }
            ]
          },
          {
            title: 'Snacks',
            products: [
              {
                title: 'Salted nuts',
                price: 5,
                quantity: 8,
                description: 'Roasted almonds and cashews.\nContains nuts.'
              }
            ]
          }
        ]
      },
      {
        title: 'Room service',
        children: [
          {
            title: 'Breakfast',
            products: [
              {
                title: 'Continental breakfast',
                price: 18,
                quantity: 40,
                description:
                  'Croissant, butter and jam, seasonal fruit, coffee or tea.\nServed 6:30–11:00.'
              }
            ]
          },
          {
            title: 'Dinner',
            products: [{ title: 'Overlook burger', price: 22, quantity: 15 }]
          }
        ]
      },
      {
        title: 'Spa',
        products: [
          {
            title: 'Massage 60 min',
            price: 80,
            quantity: 6,
            description: 'Full-body relaxing massage. Book at the front desk.'
          },
          {
            title: 'Sauna',
            price: 0,
            quantity: 0,
            description: 'Free for hotel guests, 7:00–22:00.'
          }
        ]
      }
    ];

    const insertCatalog = async (
      nodes: CategorySeed[],
      parentId: number | null
    ) => {
      for (const node of nodes) {
        const [category] = await db
          .insert(productCategories)
          .values({
            property_id: OVERLOOK_HOTEL_ID,
            parent_id: parentId,
            title: node.title
          })
          .returning({ id: productCategories.id });
        if (!category) throw new Error(`Failed to seed ${node.title}`);

        if (node.products?.length) {
          await db.insert(products).values(
            node.products.map((product) => ({
              property_id: OVERLOOK_HOTEL_ID,
              category_id: category.id,
              title: product.title,
              price: product.price.toFixed(2),
              quantity: product.quantity,
              description: product.description ?? null
            }))
          );
        }
        await insertCatalog(node.children ?? [], category.id);
      }
    };
    const countCatalog = (nodes: CategorySeed[]): [number, number] =>
      nodes.reduce<[number, number]>(
        ([categories, items], node) => {
          const [childCategories, childItems] = countCatalog(
            node.children ?? []
          );
          return [
            categories + 1 + childCategories,
            items + (node.products?.length ?? 0) + childItems
          ];
        },
        [0, 0]
      );
    await insertCatalog(catalog, null);

    // Point the demo users at The Overlook Hotel so the seeded Guest ABC
    // content is visible immediately after logging in.
    await db
      .update(users)
      .set({ selected_property_id: OVERLOOK_HOTEL_ID })
      .where(
        inArray(users.email, ['cool_new_user@example.com', 'john@example.com'])
      );

    // Demo rooms and guest devices for The Overlook Hotel: four floors of
    // twelve rooms, a tablet in every room, a TV in most, and a few devices
    // not assigned to a room yet. Devices without a property are waiting to be
    // claimed; every demo device has the same PIN.
    console.log('Creating demo rooms and devices...');
    const demoRooms = await db
      .insert(rooms)
      .values(
        [1, 2, 3, 4].flatMap((floor) =>
          Array.from({ length: 12 }, (_, index) => {
            const room_number = `${floor}${String(index + 1).padStart(2, '0')}`;
            return {
              name: `Room ${room_number}`,
              room_number,
              property_id: OVERLOOK_HOTEL_ID
            };
          })
        )
      )
      .returning();
    const pin_hash = await hashPassword(DEMO_DEVICE_PIN);

    const serial = (prefix: string, number: number) =>
      `${prefix}${String(number).padStart(4, '0')}`;
    const demoDevices: {
      serial_number: string;
      name: string | null;
      room_id: number | null;
    }[] = [
      ...demoRooms.map(({ id, room_number }, index) => ({
        serial_number: serial('R9KT40A', index + 1),
        name: `Tablet ${room_number}`,
        room_id: id
      })),
      // The last rooms have no TV yet
      ...demoRooms.slice(0, -7).map(({ id, room_number }, index) => ({
        serial_number: serial('LG55-773', index + 1),
        name: `TV ${room_number}`,
        room_id: id
      })),
      ...[
        { serial_number: serial('R9KT40A', 101), name: 'Tablet (new)' },
        { serial_number: serial('R9KT40A', 102), name: 'Tablet (spare)' },
        { serial_number: serial('R9KT40A', 103), name: null },
        { serial_number: serial('LG55-773', 101), name: 'TV (new)' },
        { serial_number: serial('LG55-773', 102), name: null },
        { serial_number: serial('PX8-0042', 1), name: 'Phone (front desk)' },
        { serial_number: serial('PX8-0042', 2), name: null }
      ].map((device) => ({ ...device, room_id: null }))
    ];

    // Minutes since each device's last signal, cycled over the list: mostly
    // online (under 15), some recently offline (hours), a few offline (days)
    // and one that never reported (null).
    const signalAges = [
      1,
      4,
      9,
      2,
      5 * 60,
      7,
      12,
      3,
      3 * 24 * 60,
      6,
      20 * 60,
      10,
      null
    ];
    await db.insert(devices).values(
      demoDevices.map((device, index) => {
        const minutesAgo = signalAges[index % signalAges.length];
        return {
          ...device,
          last_seen_at:
            minutesAgo === null
              ? null
              : new Date(Date.now() - minutesAgo * 60 * 1000),
          // A device that never reported has no known app version
          app_version:
            minutesAgo === null ? null : index % 5 === 4 ? '2.3.0' : '2.4.1',
          property_id: OVERLOOK_HOTEL_ID,
          pin_hash
        };
      })
    );
    await db.insert(devices).values(
      ['R9KT40A22MN', 'R9KT40A23PQ', 'LG55-7731302'].map((serial_number) => ({
        serial_number,
        pin_hash,
        app_version: '2.4.1',
        last_seen_at: new Date()
      }))
    );

    // Step 5: Create demo monitoring logs
    console.log('Creating demo monitoring logs...');
    await db.insert(monitoringLogs).values(buildDemoMonitoringLogs());

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
    console.log(`- Created ${guestAbcRows.length} Guest ABC entries`);
    const [categoryCount, productCount] = countCatalog(catalog);
    console.log(
      `- Created ${categoryCount} product categories and ${productCount} products`
    );
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
