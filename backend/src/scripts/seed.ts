import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { deriveLetter } from '../../../shared/types/guest-abc';
import { propertyOptionSchema } from '../../../shared/types/properties';
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
  propertyWorklogs,
  reservations,
  roles,
  rooms,
  users
} from '../db/schema';
import { truncateAllTables } from '../db/truncate-all';
import { hashPassword } from '../utils/password';

// The demo data lives in `data/*.json`, one file per entity. This script only
// reads it, fills in what is derived (dates relative to today, emails, ids)
// and inserts it.

// The Overlook Hotel — the canonical demo property. Seeded Guest ABC content,
// products, rooms and devices attach here, and demo users' selected property
// is pointed at it.
const OVERLOOK_HOTEL_ID = 'cc198b13-4933-43aa-977e-dcd95fa30770';
const DEMO_PASSWORD = 'very_cool_password';
// PIN of every demo device, claimed or not
const DEMO_DEVICE_PIN = '123412341234';

// `import.meta.dir` is Bun-only and resolves to undefined under vitest, which
// imports this module transitively via src/routes/test.ts.
const dataDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'data'
);

function loadData<T>(name: string): T {
  return JSON.parse(
    fs.readFileSync(path.join(dataDir, `${name}.json`), 'utf-8')
  );
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** A day offset from today (so the demo never goes stale) or a fixed date. */
const toDate = (value: number | string) =>
  typeof value === 'number'
    ? new Date(Date.now() + value * DAY_MS)
    : new Date(value);

async function seedUsers() {
  const password = await hashPassword(DEMO_PASSWORD);
  const demoUsers = await db
    .insert(users)
    .values([
      {
        email: 'cool_new_user@example.com',
        password,
        first_name: 'Very',
        last_name: 'Cool',
        email_verified: true
      },
      {
        email: 'john@example.com',
        password,
        first_name: 'John',
        last_name: 'Doe',
        email_verified: true,
        is_admin: true
      }
    ])
    .returning();

  await db
    .insert(roles)
    .values(
      [
        'Administrators',
        'Roomservice Manager',
        'Housekeeping Manager',
        'Roomservice Order Agent',
        'Housekeeping Agent',
        'Tester'
      ].map((name) => ({ name }))
    );

  return demoUsers;
}

type ReservationRow = typeof reservations.$inferInsert;

type ReservationSeed = Pick<
  ReservationRow,
  'booking_nr' | 'state' | 'room_name' | 'check_in_via' | 'check_out_via'
> &
  Partial<ReservationRow> & {
    /** Arrival and departure: day offsets from today, or fixed dates. */
    from: number | string;
    to: number | string;
    /**
     * Defaults to a week before an arrival given as an offset (never in the
     * future), else to now.
     */
    received?: number | string;
    balance: string;
    /** The first guest is the primary one. */
    guests: {
      first_name: string;
      last_name: string;
      nationality_code: string;
    }[];
  };

const guestEmail = (guest: { first_name: string; last_name: string }) =>
  `${`${guest.first_name} ${guest.last_name}`
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '')}@example.com`;

async function seedReservations() {
  const seeds = loadData<ReservationSeed[]>('reservations');

  const inserted = await db
    .insert(reservations)
    .values(
      seeds.map(({ from, to, received, guests: guestSeeds, ...columns }) => {
        const [primaryGuest] = guestSeeds;

        return {
          ...columns,
          booking_from: toDate(from),
          booking_to: toDate(to),
          received_at: toDate(
            received ?? (typeof from === 'number' ? Math.min(from - 7, -1) : 0)
          ),
          completed_at: columns.state === 'checked_out' ? toDate(to) : null,
          primary_guest_name: primaryGuest
            ? `${primaryGuest.first_name} ${primaryGuest.last_name}`
            : '',
          guest_email: primaryGuest ? guestEmail(primaryGuest) : null,
          adults: columns.adults ?? Math.max(guestSeeds.length, 1)
        };
      })
    )
    .returning({ id: reservations.id, booking_nr: reservations.booking_nr });

  const idByBookingNr = new Map(
    inserted.map(({ id, booking_nr }) => [booking_nr, id])
  );
  const guestRows = seeds.flatMap((seed) =>
    seed.guests.map((guest) => ({
      ...guest,
      reservation_id: idByBookingNr.get(seed.booking_nr)!,
      email: guestEmail(guest)
    }))
  );
  await db.insert(guests).values(guestRows);

  return { reservations: inserted.length, guests: guestRows.length };
}

type PropertyRow = typeof properties.$inferInsert;

async function seedCustomersAndProperties() {
  // Fewer customers than properties, so some own several
  await db
    .insert(customers)
    .values(loadData<(typeof customers.$inferInsert)[]>('customers'));

  // Famous fictional hotels. Their options run from none to "all" of them.
  const propertySeeds = loadData<
    (Omit<PropertyRow, 'options'> & {
      options?: PropertyRow['options'] | 'all';
    })[]
  >('properties');
  await db.insert(properties).values(
    propertySeeds.map(({ options, ...property }) => ({
      ...property,
      ...(options && {
        options: options === 'all' ? [...propertyOptionSchema.options] : options
      })
    }))
  );

  return propertySeeds.length;
}

async function seedGuestAbc() {
  const entries = Object.values(
    loadData<Record<string, { title: string; description: string }[]>>(
      'guest-abc-data'
    )
  ).flat();

  // The letter is derived from each title (the file's buckets are not trusted)
  await db.insert(guestAbcEntries).values(
    entries.map((entry) => ({
      property_id: OVERLOOK_HOTEL_ID,
      letter: deriveLetter(entry.title),
      title: entry.title,
      description: entry.description
    }))
  );

  return entries.length;
}

type WorklogMoment = { days_ago: number; hour: number };

/**
 * A work log covering every card state: today, yesterday, older, last year,
 * edited by the author, edited by someone else, and an entry whose author is
 * gone.
 */
async function seedWorklogs(demoUsers: { id: string; email: string }[]) {
  const userId = (email: string | null | undefined) =>
    demoUsers.find((user) => user.email === email)?.id ?? null;
  const moment = ({ days_ago, hour }: WorklogMoment) => {
    const date = new Date();
    date.setDate(date.getDate() - days_ago);
    date.setHours(hour, 15, 0, 0);
    return date;
  };

  await db.insert(propertyWorklogs).values(
    loadData<
      {
        message: string;
        author: string | null;
        created: WorklogMoment;
        editor?: string;
        updated?: WorklogMoment;
      }[]
    >('worklogs').map(({ message, author, created, editor, updated }) => ({
      property_id: OVERLOOK_HOTEL_ID,
      message,
      created_by: userId(author),
      created_at: moment(created),
      ...(updated && {
        updated_by: userId(editor),
        updated_at: moment(updated)
      })
    }))
  );
}

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

/** A catalog three levels deep, with a free item and multi-line descriptions. */
async function seedProducts(
  nodes = loadData<CategorySeed[]>('products'),
  parentId: number | null = null
) {
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
    await seedProducts(node.children ?? [], category.id);
  }
}

/**
 * Rooms and guest devices are generated, not listed: four floors of twelve
 * rooms, a tablet in every room, a TV in most, and a few devices not assigned
 * to a room yet. Devices without a property are waiting to be claimed.
 */
async function seedRoomsAndDevices() {
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
}

/**
 * ~200 logs spread over the last 30 days, denser towards now, so every period
 * preset and the pagination have something to show.
 */
async function seedMonitoringLogs() {
  const templates = loadData<
    { type: string; event: string; sub: string; ok: string; fail: string }[]
  >('monitoring-log-templates');
  const bookingNrs = ['RES-001', 'RES-002', 'RES-003', null];
  const count = 200;

  await db.insert(monitoringLogs).values(
    Array.from({ length: count }, (_, i) => {
      const template = templates[i % templates.length]!;
      const failed = i % 7 === 0;

      return {
        status: failed ? ('error' as const) : ('success' as const),
        logged_at: new Date(
          Date.now() - Math.round(30 * DAY_MS * (i / count) ** 2)
        ),
        type: template.type,
        booking_nr: bookingNrs[i % bookingNrs.length] ?? null,
        event: template.event,
        sub: template.sub,
        log_message: failed ? template.fail : template.ok
      };
    })
  );

  return count;
}

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    await truncateAllTables();

    const demoUsers = await seedUsers();
    const reservationCounts = await seedReservations();
    const propertyCount = await seedCustomersAndProperties();
    const guestAbcCount = await seedGuestAbc();
    await seedWorklogs(demoUsers);
    await seedProducts();
    await seedRoomsAndDevices();
    const logCount = await seedMonitoringLogs();

    // Point the demo users at The Overlook Hotel so its seeded content is
    // visible immediately after logging in.
    await db.update(users).set({ selected_property_id: OVERLOOK_HOTEL_ID });

    console.log('✅ Database seeded successfully!');
    console.log(
      `- ${reservationCounts.reservations} reservations, ${reservationCounts.guests} guests`
    );
    console.log(`- ${propertyCount} properties`);
    console.log(`- ${guestAbcCount} Guest ABC entries`);
    console.log(`- ${logCount} monitoring logs`);
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
