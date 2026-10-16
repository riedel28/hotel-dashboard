import type { HotelEvent } from 'shared/types/events';
import { describe, expect, test } from 'vitest';

import {
  doorsLeadMinutes,
  doorsTimeBefore,
  duplicateValues,
  durationMinutes,
  emptyEventValues,
  eventFormSchema,
  type EventFormValues,
  eventToFormValues,
  formValuesToSaveData,
  hotelAddress,
  splitMinutes
} from './event-form';

const values = (patch: Partial<EventFormValues> = {}): EventFormValues => ({
  ...emptyEventValues('DE'),
  title: 'Jazz night',
  start_date: '2026-11-20',
  start_time: '20:00',
  end_date: '2026-11-20',
  end_time: '23:30',
  venue_name: 'Lobby bar',
  address_line_1: 'Hauptstraße 1',
  zip: '10115',
  city: 'Berlin',
  ...patch
});

const errorsOf = (form: EventFormValues) => {
  const result = eventFormSchema.safeParse(form);
  return result.success
    ? {}
    : Object.fromEntries(
        result.error.issues.map((issue) => [
          issue.path.join('.'),
          issue.message
        ])
      );
};

describe('date validation', () => {
  test('a complete event is valid', () => {
    expect(errorsOf(values())).toEqual({});
  });

  test('start and end need both a date and a time', () => {
    expect(errorsOf(values({ start_time: '', end_date: '' }))).toMatchObject({
      start_date: 'start_required',
      end_date: 'end_required'
    });
  });

  test('the end must come after the start', () => {
    expect(errorsOf(values({ end_time: '20:00' }))).toEqual({
      end_date: 'event_end_order'
    });
    expect(
      errorsOf(values({ end_date: '2026-11-21', end_time: '02:00' }))
    ).toEqual({});
  });

  test('the doors open at the start at the latest', () => {
    expect(errorsOf(values({ doors_time: '20:00' }))).toEqual({});
    expect(errorsOf(values({ doors_time: '20:15' }))).toEqual({
      doors_time: 'event_doors_order'
    });
  });

  test('the required fields', () => {
    expect(
      Object.keys(
        errorsOf(
          values({
            title: ' ',
            venue_name: '',
            address_line_1: '',
            zip: '',
            city: '',
            country_code: ''
          })
        )
      ).sort()
    ).toEqual(
      [
        'address_line_1',
        'city',
        'country_code',
        'title',
        'venue_name',
        'zip'
      ].sort()
    );
  });
});

describe('timezone', () => {
  test('saves the wall clock of the property, not of the browser', () => {
    const data = formValuesToSaveData(
      values({ doors_time: '19:00' }),
      'America/New_York'
    );
    expect(data.starts_at).toBe('2026-11-21T01:00:00.000Z');
    expect(data.doors_open_at).toBe('2026-11-21T00:00:00.000Z');
  });

  test('reads back what it saved', () => {
    const form = values({ doors_time: '19:30', description: '<p>Hi</p>' });
    const data = formValuesToSaveData(form, 'Asia/Tokyo');
    const event: HotelEvent = {
      ...data,
      id: 1,
      description: data.description ?? null,
      doors_open_at: data.doors_open_at ?? null,
      address_line_2: data.address_line_2 ?? null,
      categories: [],
      image_ids: [],
      created_at: '',
      updated_at: ''
    };
    expect(eventToFormValues(event, 'Asia/Tokyo')).toEqual(form);
  });

  test('counts the duration in real time across a DST change', () => {
    // Berlin leaves summer time at 03:00 on 25 October 2026.
    expect(
      durationMinutes(
        values({
          start_date: '2026-10-25',
          start_time: '01:00',
          end_date: '2026-10-25',
          end_time: '04:00'
        }),
        'Europe/Berlin'
      )
    ).toBe(4 * 60);
  });
});

describe('doors chips', () => {
  test('put the doors that long before the start', () => {
    expect(doorsTimeBefore('20:00', 30)).toBe('19:30');
    expect(doorsTimeBefore('20:00', 60)).toBe('19:00');
    expect(doorsTimeBefore('09:15', 120)).toBe('07:15');
  });

  test('offer nothing without a start or across midnight', () => {
    expect(doorsTimeBefore('', 60)).toBeNull();
    expect(doorsTimeBefore('00:30', 60)).toBeNull();
  });

  test('the hint measures the lead whichever way the doors were set', () => {
    expect(doorsLeadMinutes(values({ doors_time: '19:15' }))).toBe(45);
    expect(doorsLeadMinutes(values())).toBeNull();
  });

  test('durations split into days, hours and minutes', () => {
    expect(splitMinutes(210)).toEqual({ days: 0, hours: 3, minutes: 30 });
    expect(splitMinutes(1500)).toEqual({ days: 1, hours: 1, minutes: 0 });
  });
});

describe('Use hotel address', () => {
  const hotel = {
    address_line_1: 'Seestraße 5',
    address_line_2: null,
    zip: '82211',
    city: 'Herrsching',
    country_code: 'DE'
  };

  test('fills the address fields only', () => {
    expect(hotelAddress(hotel)).toEqual({
      address_line_1: 'Seestraße 5',
      address_line_2: '',
      zip: '82211',
      city: 'Herrsching',
      country_code: 'DE'
    });
    expect(hotelAddress(hotel)).not.toHaveProperty('venue_name');
  });

  test('offers nothing while the hotel has no address', () => {
    expect(hotelAddress({ ...hotel, city: null })).toBeNull();
  });
});

describe('duplicate', () => {
  test('copies everything, the title marked as a copy', () => {
    const event: HotelEvent = {
      id: 7,
      title: 'Wine tasting',
      description: null,
      categories: ['food_drink'],
      starts_at: '2026-11-20T18:00:00.000Z',
      ends_at: '2026-11-20T20:00:00.000Z',
      doors_open_at: null,
      venue_name: 'Cellar',
      address_line_1: 'Hauptstraße 1',
      address_line_2: null,
      zip: '10115',
      city: 'Berlin',
      country_code: 'DE',
      image_ids: ['a', 'b'],
      created_at: '',
      updated_at: ''
    };
    expect(duplicateValues(event, 'UTC')).toMatchObject({
      title: 'Wine tasting (copy)',
      start_time: '18:00',
      image_ids: ['a', 'b']
    });
  });
});
