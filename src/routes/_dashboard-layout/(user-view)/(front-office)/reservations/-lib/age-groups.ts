import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import type {
  GuestAgeGroup,
  ReservationFormData
} from 'shared/types/reservations';

interface AgeGroup {
  group: GuestAgeGroup;
  /** The head-count field the group is planned in. */
  field: 'adults' | 'youth' | 'children' | 'infants';
  /** The fewest places a reservation can plan for the group. */
  min: number;
  /** One guest of the group. */
  label: MessageDescriptor;
  /** The group as a head count. */
  countLabel: MessageDescriptor;
}

/**
 * Single source of truth for the age groups: the head-count fields, the guest
 * dialog and the guest list all read this table, in this order.
 */
const AGE_GROUPS = [
  {
    group: 'adult',
    field: 'adults',
    min: 1,
    label: msg`Adult`,
    countLabel: msg`Adults`
  },
  {
    group: 'youth',
    field: 'youth',
    min: 0,
    // One person here; the head-count label of the same name is a plural
    label: msg({ message: 'Youth', context: 'one guest' }),
    countLabel: msg`Youth`
  },
  {
    group: 'child',
    field: 'children',
    min: 0,
    label: msg`Child`,
    countLabel: msg`Children`
  },
  {
    group: 'infant',
    field: 'infants',
    min: 0,
    label: msg`Infant`,
    countLabel: msg`Infants`
  }
] as const satisfies AgeGroup[];

const ageGroupLabel = Object.fromEntries(
  AGE_GROUPS.map(({ group, label }) => [group, label])
) as Record<GuestAgeGroup, MessageDescriptor>;

/** The part of a reservation that says who is staying: the plan and the names. */
type Occupancy = Pick<
  ReservationFormData,
  'adults' | 'youth' | 'children' | 'infants' | 'guests'
>;

export { AGE_GROUPS, ageGroupLabel, type Occupancy };
