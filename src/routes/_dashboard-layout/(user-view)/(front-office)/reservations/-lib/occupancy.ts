import type { GuestAgeGroup, GuestInput } from 'shared/types/reservations';

import { AGE_GROUPS, type Occupancy } from './age-groups';

/**
 * The head counts are the plan, the guest list is the fact. These keep the two
 * consistent wherever a reservation is loaded or its guest list changes.
 */

function countNamed(guests: GuestInput[], group: GuestAgeGroup) {
  return guests.filter((guest) => guest.age_group === group).length;
}

/** With guests on the list one of them is the primary one: the first, failing a flag. */
function withPrimary(guests: GuestInput[]): GuestInput[] {
  if (guests.length === 0 || guests.some((guest) => guest.is_primary)) {
    return guests;
  }
  return guests.map((guest, index) => ({ ...guest, is_primary: index === 0 }));
}

/**
 * A named guest is firmer than a number: each head count grows to fit the
 * guests named in its group, but never shrinks — a guest who leaves frees
 * their place.
 */
function normalizeOccupancy<T extends Occupancy>(occupancy: T): T {
  const normalized = { ...occupancy, guests: withPrimary(occupancy.guests) };
  for (const { group, field, min } of AGE_GROUPS) {
    normalized[field] = Math.max(
      occupancy[field],
      min,
      countNamed(occupancy.guests, group)
    );
  }
  return normalized;
}

/** Per age group: the guests named in it and the planned places still free. */
function getPlaces(occupancy: Occupancy) {
  return AGE_GROUPS.map((ageGroup) => {
    const named = countNamed(occupancy.guests, ageGroup.group);
    return {
      ...ageGroup,
      named,
      free: Math.max(occupancy[ageGroup.field] - named, 0)
    };
  });
}

/**
 * The group a guest of unknown age joins: the only one with free places, or
 * adults when that is not clear-cut.
 */
function defaultAgeGroup(occupancy: Occupancy): GuestAgeGroup {
  const open = getPlaces(occupancy).filter(({ free }) => free > 0);
  return open.length === 1 && open[0] ? open[0].group : 'adult';
}

export { defaultAgeGroup, getPlaces, normalizeOccupancy };
