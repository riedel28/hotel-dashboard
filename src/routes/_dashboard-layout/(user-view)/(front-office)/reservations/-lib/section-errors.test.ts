import { describe, expect, test } from 'vitest';

import { sectionsWithErrors } from './section-errors';

const sectionFields = {
  stay: ['booking_from', 'booking_to', 'room_name'],
  reservation: ['purpose'],
  guests: ['adults', 'guests']
};

describe('sectionsWithErrors', () => {
  test('names no section while the form is valid', () => {
    expect(sectionsWithErrors({}, sectionFields)).toEqual([]);
  });

  test('names each section once, in page order', () => {
    const errors = { adults: {}, room_name: {}, booking_to: {} };
    expect(sectionsWithErrors(errors, sectionFields)).toEqual([
      'stay',
      'guests'
    ]);
  });

  test('ignores a field that belongs to no section', () => {
    expect(sectionsWithErrors({ booking_nr: {} }, sectionFields)).toEqual([]);
  });
});
