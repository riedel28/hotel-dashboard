import type { GuestAgeGroup, GuestInput } from 'shared/types/reservations';
import { describe, expect, test } from 'vitest';

import { defaultAgeGroup, getPlaces, normalizeOccupancy } from './occupancy';

const guest = (age_group: GuestAgeGroup, is_primary = false): GuestInput => ({
  first_name: 'Jane',
  last_name: 'Doe',
  email: null,
  nationality_code: 'DE',
  is_primary,
  age_group
});

const occupancy = (
  counts: [number, number, number, number],
  guests: GuestInput[]
) => ({
  adults: counts[0],
  youth: counts[1],
  children: counts[2],
  infants: counts[3],
  guests
});

describe('normalizeOccupancy', () => {
  test('grows a head count to fit the guests named in its group', () => {
    const result = normalizeOccupancy(
      occupancy(
        [1, 0, 0, 0],
        [guest('adult', true), guest('adult'), guest('child')]
      )
    );

    expect(result).toMatchObject({ adults: 2, youth: 0, children: 1 });
  });

  test('never shrinks a head count, and keeps one adult planned', () => {
    expect(normalizeOccupancy(occupancy([3, 2, 0, 0], []))).toMatchObject({
      adults: 3,
      youth: 2
    });
    expect(normalizeOccupancy(occupancy([0, 0, 0, 0], [])).adults).toBe(1);
  });

  test('makes the first guest primary when nobody is flagged', () => {
    const { guests } = normalizeOccupancy(
      occupancy([2, 0, 0, 0], [guest('adult'), guest('adult')])
    );

    expect(guests.map((g) => g.is_primary)).toEqual([true, false]);
  });

  test('leaves an existing primary guest alone', () => {
    const { guests } = normalizeOccupancy(
      occupancy([2, 0, 0, 0], [guest('adult'), guest('adult', true)])
    );

    expect(guests.map((g) => g.is_primary)).toEqual([false, true]);
  });
});

describe('getPlaces', () => {
  test('reports the named guests and the free places per group', () => {
    const places = getPlaces(
      occupancy([2, 0, 1, 0], [guest('adult', true), guest('child')])
    );

    expect(
      places.map(({ group, named, free }) => [group, named, free])
    ).toEqual([
      ['adult', 1, 1],
      ['youth', 0, 0],
      ['child', 1, 0],
      ['infant', 0, 0]
    ]);
  });
});

describe('defaultAgeGroup', () => {
  test('is the only group with free places', () => {
    expect(
      defaultAgeGroup(occupancy([1, 0, 2, 0], [guest('adult', true)]))
    ).toBe('child');
  });

  test('falls back to adult when several groups or none have free places', () => {
    expect(defaultAgeGroup(occupancy([2, 0, 1, 0], []))).toBe('adult');
    expect(
      defaultAgeGroup(occupancy([1, 0, 0, 0], [guest('adult', true)]))
    ).toBe('adult');
  });
});
